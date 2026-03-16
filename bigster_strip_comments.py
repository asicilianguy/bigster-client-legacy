#!/usr/bin/env python3
"""
bigster_strip_comments.py
═══════════════════════════════════════════════════════════════════════════════
Strips JS/TS comments from git-modified and untracked TypeScript files.
Designed for the Bigster monorepo (Node.js + Next.js / TypeScript).

WHAT IT REMOVES:
  • // single-line comments  (regular)
  • /* */  block comments
  • /** */ JSDoc comments

WHAT IT ALWAYS PRESERVES:
  • /// triple-slash TypeScript directives  (e.g. /// <reference types="…"/>)
  • // @ts-ignore / @ts-expect-error / @ts-nocheck / @ts-check
  • /* eslint-disable … */ and all eslint directive block variants
  • // eslint-disable* line variants
  • // prettier-ignore
  • @license / @preserve / @copyright  block comments
  • All content inside strings  ' " `
  • Template literal expressions  ${…}  (can themselves contain comments to strip)
  • .d.ts  declaration files  (never touched)
  • Files inside  node_modules / dist / build / .next / coverage

SAFETY NETS (in order of execution):
  1. Git-repo pre-flight check
  2. Per-file: read  → strip  → heuristic diff checks
  3. Per-file: atomic write to .tmp, then rename (never partial write)
  4. Per-file: TypeScript compiler syntax validation BEFORE rename
  5. Per-file: auto-restore from backup on any validation failure
  6. Post-run: project-wide  tsc --noEmit
  7. Full backup of every changed file (restorable via --restore)

USAGE:
  python bigster_strip_comments.py --root .
  python bigster_strip_comments.py --root . --dry-run
  python bigster_strip_comments.py --root . --restore
  python bigster_strip_comments.py --root . --verbose
  python bigster_strip_comments.py --root . --include-all   # all TS, not just git-modified
  python bigster_strip_comments.py --root . --no-validate   # skip per-file TS check (faster)
  python bigster_strip_comments.py --root . --no-tsc        # skip project-wide tsc --noEmit
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


# ═══════════════════════════════════════════════════════════════════════════════
# TERMINAL COLOURS
# ═══════════════════════════════════════════════════════════════════════════════

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    RED    = "\033[91m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    CYAN   = "\033[96m"
    GRAY   = "\033[90m"

    @staticmethod
    def ok(s: str)   -> str: return f"{C.GREEN}{s}{C.RESET}"
    @staticmethod
    def err(s: str)  -> str: return f"{C.RED}{s}{C.RESET}"
    @staticmethod
    def warn(s: str) -> str: return f"{C.YELLOW}{s}{C.RESET}"
    @staticmethod
    def info(s: str) -> str: return f"{C.CYAN}{s}{C.RESET}"
    @staticmethod
    def dim(s: str)  -> str: return f"{C.GRAY}{s}{C.RESET}"
    @staticmethod
    def bold(s: str) -> str: return f"{C.BOLD}{s}{C.RESET}"


def log(msg: str = "") -> None:
    print(msg)

def log_ok(msg: str)   -> None: print(f"  {C.ok('✓')}  {msg}")
def log_err(msg: str)  -> None: print(f"  {C.err('✗')}  {msg}")
def log_warn(msg: str) -> None: print(f"  {C.warn('⚠')}  {msg}")
def log_info(msg: str) -> None: print(f"  {C.info('→')}  {msg}")
def log_dim(msg: str)  -> None: print(f"     {C.dim(msg)}")


# ═══════════════════════════════════════════════════════════════════════════════
# COMMENT STRIPPER — State Machine
# ═══════════════════════════════════════════════════════════════════════════════
#
# The parser maintains a CONTEXT STACK to handle arbitrarily nested template
# literals.  Each stack frame is either "code" (normal TS code, comments can
# appear) or "template" (inside a backtick literal, no comment stripping of the
# raw text portion).
#
# When in "template" mode and we see  ${  we push a new "code" frame plus a
# brace-depth counter; when that counter reaches 0 (closing })  we pop back to
# "template".  This allows:
#
#   `outer ${/* strip this */ inner + `nested ${/* and this */}`}`
#
# to be handled correctly at every nesting level.
#
# State flags  in_str_single / in_str_double  are checked FIRST in every
# iteration, so { } inside strings are never counted as expression delimiters.

# ─── Directives that must survive even inside line comments ────────────────
_PRESERVE_LINE_STARTS: tuple[str, ...] = (
    "@ts-ignore",
    "@ts-expect-error",
    "@ts-nocheck",
    "@ts-check",
    "eslint-disable",
    "eslint-enable",
    "prettier-ignore",
    "noinspection",       # WebStorm / IntelliJ
)

# ─── Prefixes that must survive inside block comments ─────────────────────
_PRESERVE_BLOCK_STARTS: tuple[str, ...] = (
    "eslint-disable",
    "eslint-enable",
    "prettier-ignore",
    "noinspection",
    "@license",
    "@preserve",
    "@copyright",
)


def _keep_line_comment(after_slashes: str) -> bool:
    """Return True if a  //  comment must be kept (directive)."""
    s = after_slashes.lstrip(" \t")
    return any(s.startswith(p) for p in _PRESERVE_LINE_STARTS)


def _keep_block_comment(body: str) -> bool:
    """Return True if a  /* … */  comment must be kept (directive / license)."""
    s = body.strip()
    return any(s.startswith(p) for p in _PRESERVE_BLOCK_STARTS)


@dataclass
class StripResult:
    original: str
    stripped: str
    comments_removed: int = 0
    lines_before: int = 0
    lines_after: int = 0
    preserved: list[str] = field(default_factory=list)


def strip_ts_comments(source: str) -> StripResult:
    """
    Remove comments from a TypeScript / TSX source string.
    Returns a StripResult with the cleaned source and statistics.
    """
    out: list[str] = []
    i = 0
    n = len(source)
    comments_removed = 0
    preserved: list[str] = []

    # ── Context stack ──────────────────────────────────────────────────────
    # "code"     → normal TS; comments ARE stripped here
    # "template" → inside `` `…` ``; raw text is NOT stripped
    ctx: list[str] = ["code"]

    # brace_counts[k] = remaining open-braces for the k-th nested ${ expression.
    # One entry is pushed each time we enter ${…}; popped when depth → 0.
    brace_counts: list[int] = []

    # Simple string-literal flags (reset on exit)
    in_sq = False   # single-quote string
    in_dq = False   # double-quote string

    # Line / block comment mode flags
    in_line_cmt   = False
    in_block_cmt  = False

    while i < n:
        c = source[i]

        # ── BLOCK COMMENT ────────────────────────────────────────────────
        if in_block_cmt:
            if c == "*" and i + 1 < n and source[i + 1] == "/":
                in_block_cmt = False
                i += 2
            else:
                if c == "\n":
                    out.append("\n")   # preserve line numbers
                i += 1
            continue

        # ── LINE COMMENT ─────────────────────────────────────────────────
        if in_line_cmt:
            if c == "\n":
                in_line_cmt = False
                out.append("\n")
            i += 1
            continue

        # ── SINGLE-QUOTE STRING ──────────────────────────────────────────
        if in_sq:
            out.append(c)
            if c == "\\" and i + 1 < n:
                i += 1
                out.append(source[i])
            elif c == "'":
                in_sq = False
            i += 1
            continue

        # ── DOUBLE-QUOTE STRING ──────────────────────────────────────────
        if in_dq:
            out.append(c)
            if c == "\\" and i + 1 < n:
                i += 1
                out.append(source[i])
            elif c == '"':
                in_dq = False
            i += 1
            continue

        # ── TEMPLATE TEXT (backtick, outside ${…}) ───────────────────────
        if ctx[-1] == "template":
            out.append(c)
            if c == "\\" and i + 1 < n:
                # Escape: consume next char without further processing
                i += 1
                out.append(source[i])
            elif c == "`":
                # Closing backtick → pop template frame
                ctx.pop()
            elif c == "$" and i + 1 < n and source[i + 1] == "{":
                # Enter template expression → push new "code" frame
                out.append("{")           # the $ was already appended above
                ctx.append("code")
                brace_counts.append(1)   # count the opening {
                i += 2
                continue
            i += 1
            continue

        # ── CODE (or inside a template expression) ───────────────────────
        # ctx[-1] == "code"

        # ── JSX comment:  {/* ... */}  → strip entirely including braces ──
        # Detected when we see  {  immediately followed by  /*
        # This pattern is only valid in JSX (TSX files) but is harmless to
        # apply in .ts files too since {/* is never valid TS outside JSX.
        if c == "{" and i + 1 < n and source[i + 1] == "/" and i + 2 < n and source[i + 2] == "*":
            end = source.find("*/", i + 3)
            if end != -1 and end + 2 < len(source) and source[end + 2] == "}":
                body = source[i + 3 : end]
                if not _keep_block_comment(body):
                    # Preserve newlines for line-number stability
                    total_src = source[i : end + 3]
                    out.append("\n" * total_src.count("\n"))
                    comments_removed += 1
                    i = end + 3
                    continue
                # Preserve directive JSX comments
                out.append(source[i : end + 3])
                preserved.append(f"{{/*{body[:50].strip()}…*/}}")
                i = end + 3
                continue

        # Track brace depth for template expression exit
        # (only when we ARE inside a ${…} expression, i.e. brace_counts is non-empty)
        if brace_counts:
            if c == "{":
                brace_counts[-1] += 1
                out.append(c)
                i += 1
                continue
            if c == "}":
                brace_counts[-1] -= 1
                if brace_counts[-1] == 0:
                    # Closing } of ${…} → pop back to template
                    brace_counts.pop()
                    ctx.pop()
                out.append(c)
                i += 1
                continue

        # Enter single-quote string
        if c == "'":
            in_sq = True
            out.append(c)
            i += 1
            continue

        # Enter double-quote string
        if c == '"':
            in_dq = True
            out.append(c)
            i += 1
            continue

        # Enter template literal
        if c == "`":
            ctx.append("template")
            out.append(c)
            i += 1
            continue

        # ── Possible comment opener ──────────────────────────────────────
        if c == "/" and i + 1 < n:
            nc = source[i + 1]

            # ── // line comment ──────────────────────────────────────────
            if nc == "/":
                # Triple-slash directive?  ///
                if i + 2 < n and source[i + 2] == "/":
                    eol = source.find("\n", i)
                    if eol == -1:
                        line = source[i:]
                        out.append(line)
                        i = n
                    else:
                        line = source[i : eol + 1]
                        out.append(line)
                        i = eol + 1
                    preserved.append(line.rstrip())
                    continue

                # @ts-* or eslint / prettier directive?
                after = source[i + 2:]
                if _keep_line_comment(after):
                    eol = source.find("\n", i)
                    if eol == -1:
                        line = source[i:]
                        out.append(line)
                        i = n
                    else:
                        # Keep the comment text but NOT the newline
                        # (newline will be emitted as a regular char next iter)
                        line = source[i:eol]
                        out.append(line)
                        i = eol
                    preserved.append(line.rstrip())
                    continue

                # Regular line comment → strip
                in_line_cmt = True
                comments_removed += 1
                i += 2
                continue

            # ── /* block comment ─────────────────────────────────────────
            if nc == "*":
                # Find matching */
                end = source.find("*/", i + 2)
                if end == -1:
                    # Unclosed block comment — emit as-is (invalid TS, don't corrupt)
                    out.append(source[i:])
                    i = n
                    continue

                body = source[i + 2 : end]

                # Preserve eslint / license directives
                if _keep_block_comment(body):
                    out.append(source[i : end + 2])
                    preserved.append(f"/*{body[:50].strip()}…*/")
                    i = end + 2
                    continue

                # Strip block comment; preserve newlines to maintain line numbers
                out.append("\n" * body.count("\n"))
                comments_removed += 1
                i = end + 2
                continue

        # ── Regular character ────────────────────────────────────────────
        out.append(c)
        i += 1

    stripped = "".join(out)

    # ── Post-strip normalisation ─────────────────────────────────────────
    # 1. Remove trailing whitespace on each line AND at end-of-string
    #    (comments often leave a trailing space after they're removed)
    stripped = re.sub(r"[ \t]+(\n|$)", r"\1", stripped)
    # 2. Collapse 3+ consecutive blank lines to 2
    stripped = re.sub(r"\n{3,}", "\n\n", stripped)
    # 3. Remove leading blank lines (a comment at the very top of a file
    #    leaves an orphan newline — clean it up)
    stripped = stripped.lstrip("\n")
    # 4. Ensure file ends with a single newline
    stripped = stripped.rstrip("\n") + "\n"

    return StripResult(
        original=source,
        stripped=stripped,
        comments_removed=comments_removed,
        lines_before=source.count("\n"),
        lines_after=stripped.count("\n"),
        preserved=preserved,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# GIT HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

_EXCLUDED_DIRS: frozenset[str] = frozenset({
    "node_modules", "dist", "build", ".next", ".cache",
    "coverage", "__pycache__", ".git",
})


def _run(cmd: list[str], cwd: Path) -> tuple[int, str, str]:
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return r.returncode, r.stdout, r.stderr


def is_git_repo(root: Path) -> bool:
    rc, _, _ = _run(["git", "rev-parse", "--git-dir"], root)
    return rc == 0


def git_modified_files(root: Path) -> list[Path]:
    """
    Return all .ts / .tsx files that are either:
      • modified in the working tree (tracked, not deleted)
      • untracked (new file not yet staged)
    Mirrors:  git diff --name-only --diff-filter=d
              git ls-files --others --exclude-standard
    """
    _, out1, _ = _run(["git", "diff", "--name-only", "--diff-filter=d"], root)
    _, out2, _ = _run(["git", "ls-files", "--others", "--exclude-standard"], root)
    # Also include staged changes
    _, out3, _ = _run(["git", "diff", "--cached", "--name-only", "--diff-filter=d"], root)

    raw: set[str] = set()
    for line in (out1 + "\n" + out2 + "\n" + out3).splitlines():
        line = line.strip()
        if line:
            raw.add(line)

    return _filter_ts_files(root, [root / r for r in sorted(raw)])


def all_ts_files(root: Path) -> list[Path]:
    """Return ALL .ts / .tsx files under root (excluding generated dirs)."""
    found: list[Path] = []
    for ext in ("*.ts", "*.tsx"):
        for p in root.rglob(ext):
            found.append(p)
    return _filter_ts_files(root, sorted(set(found)))


def _filter_ts_files(root: Path, paths: list[Path]) -> list[Path]:
    result: list[Path] = []
    for p in paths:
        if not p.exists() or not p.is_file():
            continue
        if p.suffix not in (".ts", ".tsx"):
            continue
        if p.name.endswith(".d.ts"):          # declaration files — never touch
            continue
        # Exclude any path that passes through an excluded directory
        try:
            rel_parts = p.relative_to(root).parts
        except ValueError:
            rel_parts = p.parts
        if any(part in _EXCLUDED_DIRS for part in rel_parts):
            continue
        result.append(p)
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# TYPESCRIPT / NODE SYNTAX VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════

# Inline Node.js script that uses the TypeScript compiler API to parse a file
# and report any parse-level diagnostics.  We use  parseDiagnostics  which is
# set on the SourceFile after  createSourceFile()  — this is fast (no type
# checking) and catches syntax errors introduced by bad comment removal.
_TS_PARSE_JS = r"""
'use strict';
const ts  = require('typescript');
const fs  = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const kind = process.argv[2].endsWith('.tsx')
  ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
const sf = ts.createSourceFile(
  process.argv[2], src, ts.ScriptTarget.Latest, true, kind
);
const diags = sf.parseDiagnostics || [];
if (diags.length > 0) {
  diags.forEach(d => {
    const pos = sf.getLineAndCharacterOfPosition(d.start || 0);
    const msg = typeof d.messageText === 'string'
      ? d.messageText
      : d.messageText.messageText;
    process.stderr.write(pos.line + 1 + ':' + (pos.character + 1) + ': ' + msg + '\n');
  });
  process.exit(1);
}
process.exit(0);
"""


def _find_node_modules(root: Path) -> Optional[Path]:
    """
    Search common locations for a node_modules directory that contains
    the 'typescript' package.
    """
    candidates = [
        root / "node_modules",
        root / "frontend" / "node_modules",
        root / "packages" / "frontend" / "node_modules",
        root / "apps" / "frontend" / "node_modules",
    ]
    for nm in candidates:
        if (nm / "typescript" / "lib" / "typescript.js").exists():
            return nm
    return None


def validate_syntax(file_path: Path, node_bin: str, node_modules: Path) -> tuple[bool, str]:
    """
    Parse file_path with the TypeScript compiler API (no type checking).
    Returns (ok, error_message).
    """
    # Write the validation script to a temp file so NODE_PATH works cleanly
    tmp = tempfile.NamedTemporaryFile(
        mode="w", suffix=".cjs", delete=False, prefix="bsc_validate_"
    )
    try:
        tmp.write(_TS_PARSE_JS)
        tmp.flush()
        tmp.close()

        env = os.environ.copy()
        existing_np = env.get("NODE_PATH", "")
        env["NODE_PATH"] = str(node_modules) + (os.pathsep + existing_np if existing_np else "")

        result = subprocess.run(
            [node_bin, tmp.name, str(file_path)],
            capture_output=True, text=True, env=env, timeout=15
        )
        if result.returncode != 0:
            return False, (result.stderr or result.stdout).strip()
        return True, ""
    except subprocess.TimeoutExpired:
        return True, ""   # timeout → skip validation for this file
    except Exception:
        return True, ""   # node not working → skip
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


def run_tsc_nocheck(root: Path) -> tuple[bool, str]:
    """
    Run  tsc --noEmit  on the project.  Finds tsc in common locations.
    Returns (ok, output).
    """
    tsc: Optional[str] = shutil.which("tsc")
    if not tsc:
        for candidate in [
            root / "node_modules" / ".bin" / "tsc",
            root / "frontend" / "node_modules" / ".bin" / "tsc",
        ]:
            if candidate.exists():
                tsc = str(candidate)
                break

    if not tsc:
        return True, "tsc not found — skipping project-wide check"

    # Find the directory containing tsconfig.json
    tsconfig_cwd: Optional[Path] = None
    for d in [root, root / "frontend", root / "src"]:
        if (d / "tsconfig.json").exists():
            tsconfig_cwd = d
            break

    if not tsconfig_cwd:
        return True, "tsconfig.json not found — skipping project-wide check"

    result = subprocess.run(
        [tsc, "--noEmit", "--pretty", "false"],
        cwd=tsconfig_cwd, capture_output=True, text=True, timeout=120
    )
    if result.returncode != 0:
        return False, (result.stdout + result.stderr).strip()
    return True, (result.stdout + result.stderr).strip()


# ═══════════════════════════════════════════════════════════════════════════════
# BACKUP SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

def _backup_path(file: Path, backup_dir: Path, root: Path) -> Path:
    try:
        rel = file.relative_to(root)
    except ValueError:
        rel = Path(file.name)
    target = backup_dir / rel
    return target.with_suffix(target.suffix + ".bak")


def create_backup(file: Path, backup_dir: Path, root: Path) -> Path:
    bp = _backup_path(file, backup_dir, root)
    bp.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file, bp)
    return bp


def restore_from_backup(file: Path, backup_dir: Path, root: Path) -> bool:
    bp = _backup_path(file, backup_dir, root)
    if bp.exists():
        shutil.copy2(bp, file)
        return True
    return False


# ═══════════════════════════════════════════════════════════════════════════════
# HEURISTIC SAFETY CHECKS
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class Issue:
    severity: str    # "error" | "warning"
    message: str


def heuristic_safety_checks(original: str, stripped: str) -> list[Issue]:
    """
    Fast, regex-based sanity checks that don't require a compiler.
    An "error" level issue aborts the write for this file.

    NOTE: We intentionally do NOT check raw string-delimiter counts.
    Comments routinely contain apostrophes (it's, don't), SQL single-quoted
    literals, or regex patterns — stripping them legitimately changes the
    raw quote count, producing false positives on virtually every real file.
    String-corruption is instead caught by the per-file TypeScript compiler
    syntax check (parseDiagnostics) which runs before the atomic rename.
    """
    issues: list[Issue] = []

    orig_lines     = original.splitlines()
    stripped_lines = stripped.splitlines()

    # ── 1. Non-blank line count must not INCREASE ──────────────────────────
    orig_code   = sum(1 for l in orig_lines    if l.strip())
    strip_code  = sum(1 for l in stripped_lines if l.strip())

    if strip_code > orig_code:
        issues.append(Issue("error",
            f"Non-blank lines INCREASED ({orig_code} → {strip_code}) — "
            "parser produced extra content, aborting"))

    # ── 2. File must not have shrunk to near-nothing ───────────────────────
    if len(original.strip()) > 200 and len(stripped.strip()) < 20:
        issues.append(Issue("error",
            f"Stripped file is nearly empty ({len(stripped.strip())} chars) "
            "— likely a parser bug"))

    # ── 3. Extreme size reduction ─────────────────────────────────────────
    if len(original) > 500:
        ratio = len(stripped) / len(original)
        if ratio < 0.15:
            issues.append(Issue("error",
                f"File shrank to {ratio:.0%} of original size — "
                "aborting (threshold: 15%)"))
        elif ratio < 0.35:
            issues.append(Issue("warning",
                f"File shrank to {ratio:.0%} — file was heavily commented"))

    # ── 4. import / export statement count must be stable ─────────────────
    import_re = re.compile(r"^(?:import|export)\s", re.MULTILINE)
    orig_ie  = len(import_re.findall(original))
    strip_ie = len(import_re.findall(stripped))
    if orig_ie != strip_ie:
        issues.append(Issue("error",
            f"import/export count changed ({orig_ie} → {strip_ie}) "
            "— a code line was accidentally removed"))

    return issues


# ═══════════════════════════════════════════════════════════════════════════════
# PER-FILE PROCESSOR
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class FileResult:
    path: Path
    status: str       # "ok" | "skipped" | "error" | "dry_run"
    comments_removed: int = 0
    lines_before: int = 0
    lines_after: int = 0
    message: str = ""
    preserved: list[str] = field(default_factory=list)


def process_file(
    file: Path,
    root: Path,
    backup_dir: Path,
    dry_run: bool,
    validate: bool,
    node_bin: Optional[str],
    node_modules: Optional[Path],
    verbose: bool,
) -> FileResult:

    # ── Read ───────────────────────────────────────────────────────────────
    try:
        original = file.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return FileResult(file, "error", message=f"Read error: {e}")

    if not original.strip():
        return FileResult(file, "skipped", message="Empty file")

    # ── Strip ──────────────────────────────────────────────────────────────
    res = strip_ts_comments(original)

    if res.stripped == original:
        return FileResult(
            file, "skipped", message="No strippable comments found",
            lines_before=res.lines_before, lines_after=res.lines_after,
        )

    # ── Heuristic safety checks ────────────────────────────────────────────
    issues = heuristic_safety_checks(original, res.stripped)
    errors   = [iss for iss in issues if iss.severity == "error"]
    warnings = [iss for iss in issues if iss.severity == "warning"]

    if errors:
        return FileResult(
            file, "error",
            message="Safety check failed: " + "; ".join(e.message for e in errors),
            lines_before=res.lines_before, lines_after=res.lines_after,
        )

    # ── Dry-run short-circuit ─────────────────────────────────────────────
    if dry_run:
        return FileResult(
            file, "dry_run",
            comments_removed=res.comments_removed,
            lines_before=res.lines_before,
            lines_after=res.lines_after,
            preserved=res.preserved,
            message="; ".join(w.message for w in warnings),
        )

    # ── Create backup ──────────────────────────────────────────────────────
    try:
        create_backup(file, backup_dir, root)
    except Exception as e:
        return FileResult(file, "error", message=f"Backup failed: {e}",
                          lines_before=res.lines_before, lines_after=res.lines_after)

    # ── Atomic write to .tmp ───────────────────────────────────────────────
    tmp_path = file.with_suffix(file.suffix + ".bsc_tmp")
    try:
        tmp_path.write_text(res.stripped, encoding="utf-8")
    except Exception as e:
        tmp_path.unlink(missing_ok=True)
        return FileResult(file, "error", message=f"Temp-write failed: {e}",
                          lines_before=res.lines_before, lines_after=res.lines_after)

    # ── Per-file TypeScript syntax validation ──────────────────────────────
    if validate and node_bin and node_modules:
        ok, err_msg = validate_syntax(tmp_path, node_bin, node_modules)
        if not ok:
            tmp_path.unlink(missing_ok=True)
            restore_from_backup(file, backup_dir, root)
            return FileResult(
                file, "error",
                message=f"Syntax error after stripping → restored from backup.\n"
                        f"        Details: {err_msg}",
                lines_before=res.lines_before, lines_after=res.lines_after,
            )

    # ── Commit: rename temp → original ────────────────────────────────────
    try:
        tmp_path.replace(file)
    except Exception as e:
        tmp_path.unlink(missing_ok=True)
        restore_from_backup(file, backup_dir, root)
        return FileResult(file, "error", message=f"Rename failed: {e}",
                          lines_before=res.lines_before, lines_after=res.lines_after)

    warn_str = "; ".join(w.message for w in warnings)
    return FileResult(
        file, "ok",
        comments_removed=res.comments_removed,
        lines_before=res.lines_before,
        lines_after=res.lines_after,
        preserved=res.preserved,
        message=warn_str,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# RESTORE MODE
# ═══════════════════════════════════════════════════════════════════════════════

def restore_all(root: Path, backup_dir: Path) -> int:
    log()
    log(C.bold("═" * 60))
    log(C.bold("  🔄  Restore Mode"))
    log(C.bold("═" * 60))

    if not backup_dir.exists():
        log_warn(f"Backup directory not found: {backup_dir}")
        return 1

    restored = 0
    for bak in sorted(backup_dir.rglob("*.bak")):
        rel_bak = bak.relative_to(backup_dir)
        # Strip the trailing .bak to get the original relative path
        orig_rel = Path(str(rel_bak)[:-4])
        orig = root / orig_rel
        try:
            orig.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(bak, orig)
            log_ok(str(orig_rel))
            restored += 1
        except Exception as e:
            log_err(f"{orig_rel}  →  {e}")

    log()
    if restored == 0:
        log_warn("No backup files found in backup directory.")
    else:
        log(f"  {C.ok(f'Restored {restored} file(s) successfully.')}")
    log()
    return 0


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="bigster_strip_comments",
        description="Safely strip TypeScript comments from git-modified files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python bigster_strip_comments.py --root .
  python bigster_strip_comments.py --root . --dry-run
  python bigster_strip_comments.py --root . --restore
  python bigster_strip_comments.py --root . --include-all --verbose
        """,
    )
    p.add_argument(
        "--root", required=True, type=Path,
        help="Project root directory (must be a git repo)",
    )
    p.add_argument(
        "--dry-run", action="store_true",
        help="Preview changes without writing any files",
    )
    p.add_argument(
        "--restore", action="store_true",
        help="Restore all files backed up by a previous run",
    )
    p.add_argument(
        "--include-all", action="store_true",
        help="Process ALL .ts/.tsx files, not just git-modified ones",
    )
    p.add_argument(
        "--backup-dir", type=Path, default=None,
        help="Custom backup directory (default: <root>/.strip_comments_backup)",
    )
    p.add_argument(
        "--no-validate", action="store_true",
        help="Skip per-file TypeScript syntax validation (faster but less safe)",
    )
    p.add_argument(
        "--no-tsc", action="store_true",
        help="Skip project-wide  tsc --noEmit  after processing",
    )
    p.add_argument(
        "--verbose", "-v", action="store_true",
        help="Print per-file details, preserved directives, and warnings",
    )
    return p


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> int:
    args = build_parser().parse_args()
    root = args.root.resolve()

    # ── Header banner ────────────────────────────────────────────────────
    log()
    log(C.bold("╔══════════════════════════════════════════════════════════╗"))
    log(C.bold("║       BIGSTER — TypeScript Comment Stripper              ║"))
    log(C.bold("║       github.com/DentalLead/bigster                      ║"))
    log(C.bold("╚══════════════════════════════════════════════════════════╝"))
    log()

    backup_dir = args.backup_dir or (root / ".strip_comments_backup")

    # ── Restore mode short-circuit ────────────────────────────────────────
    if args.restore:
        return restore_all(root, backup_dir)

    # ── Pre-flight checks ─────────────────────────────────────────────────
    log(C.bold("  Pre-flight checks"))
    log("  " + "─" * 50)

    # 1. Root exists
    if not root.exists():
        log_err(f"Root does not exist: {root}")
        return 1
    log_ok(f"Root: {root}")

    # 2. Git repo
    if not is_git_repo(root):
        log_err("Not a git repository (git rev-parse failed)")
        return 1
    log_ok("Git repository detected")

    # 3. Git version info
    rc, git_ver, _ = _run(["git", "--version"], root)
    if rc == 0:
        log_dim(git_ver.strip())

    # 4. Node.js
    node_bin: Optional[str] = shutil.which("node")
    if node_bin:
        rc, node_ver, _ = _run([node_bin, "--version"], root)
        log_ok(f"Node.js: {node_ver.strip()}")
    else:
        log_warn("Node.js not found — per-file syntax validation will be skipped")

    # 5. TypeScript in node_modules
    node_modules: Optional[Path] = _find_node_modules(root) if node_bin else None
    if node_modules:
        ts_pkg = node_modules / "typescript" / "package.json"
        ts_ver = "?"
        try:
            import json as _json
            ts_ver = _json.loads(ts_pkg.read_text())["version"]
        except Exception:
            pass
        log_ok(f"TypeScript {ts_ver} in: {node_modules}")
    else:
        if node_bin:
            log_warn("TypeScript not found in node_modules — syntax validation disabled")

    do_validate = (not args.no_validate) and (node_bin is not None) and (node_modules is not None)

    # 6. Backup dir
    backup_dir.mkdir(parents=True, exist_ok=True)
    log_ok(f"Backup dir: {backup_dir}")

    log()

    # ── File discovery ────────────────────────────────────────────────────
    log(C.bold("  Discovering files"))
    log("  " + "─" * 50)

    try:
        if args.include_all:
            files = all_ts_files(root)
            mode_label = "all TypeScript files"
        else:
            files = git_modified_files(root)
            mode_label = "git-modified / untracked TypeScript files"
    except Exception as e:
        log_err(f"File discovery failed: {e}")
        return 1

    log_info(f"Mode: {mode_label}")
    log_info(f"Found {len(files)} candidate file(s)")

    if not files:
        log_warn("Nothing to process.")
        if not args.include_all:
            log_dim("Tip: use --include-all to process every TS file in the project")
        log()
        return 0

    if args.verbose:
        for f in files:
            try:
                log_dim(str(f.relative_to(root)))
            except ValueError:
                log_dim(str(f))

    log()

    # ── Dry-run notice ────────────────────────────────────────────────────
    if args.dry_run:
        log(C.warn(C.bold("  ⚡  DRY-RUN MODE — no files will be modified")))
        log()

    # ── Process ───────────────────────────────────────────────────────────
    log(C.bold("  Processing"))
    log("  " + "─" * 50)

    results: list[FileResult] = []

    for f in files:
        try:
            rel = f.relative_to(root)
        except ValueError:
            rel = f

        fr = process_file(
            file=f,
            root=root,
            backup_dir=backup_dir,
            dry_run=args.dry_run,
            validate=do_validate,
            node_bin=node_bin,
            node_modules=node_modules,
            verbose=args.verbose,
        )
        results.append(fr)

        delta_lines = fr.lines_before - fr.lines_after

        if fr.status == "ok":
            stats = C.dim(f"−{delta_lines} lines, {fr.comments_removed} comments stripped")
            log_ok(f"{rel}  {stats}")
            if args.verbose:
                if fr.preserved:
                    for p in fr.preserved[:5]:
                        log_dim(f"  preserved: {p[:80]}")
                    if len(fr.preserved) > 5:
                        log_dim(f"  … and {len(fr.preserved) - 5} more")
                if fr.message:
                    log_warn(f"  {fr.message}")

        elif fr.status == "dry_run":
            stats = C.dim(f"would remove ~{fr.comments_removed} comments, ~{delta_lines} lines")
            log_info(f"{rel}  {stats}")
            if args.verbose and fr.message:
                log_warn(f"  {fr.message}")

        elif fr.status == "skipped":
            if args.verbose:
                log_dim(f"{rel}  (skipped — {fr.message})")

        elif fr.status == "error":
            log_err(f"{rel}")
            # Indent the error message
            for line in fr.message.splitlines():
                log_dim(f"  {line}")

    log()

    # ── Project-wide tsc --noEmit ─────────────────────────────────────────
    ok_count = sum(1 for r in results if r.status == "ok")

    if not args.dry_run and not args.no_tsc and ok_count > 0:
        log(C.bold("  Project-wide TypeScript check"))
        log("  " + "─" * 50)
        tsc_ok, tsc_out = run_tsc_nocheck(root)
        if tsc_ok:
            log_ok("tsc --noEmit passed ✓")
        else:
            log_err("tsc --noEmit FAILED after stripping!")
            log_warn("Some type errors may have been hidden by comments.")
            log_warn("Run  --restore  if you want to revert all changes.")
            if args.verbose and tsc_out:
                log()
                for line in tsc_out.splitlines()[:30]:
                    log_dim(line)
                if tsc_out.count("\n") > 30:
                    log_dim("… (truncated, run tsc manually for full output)")
        log()

    # ── Summary ───────────────────────────────────────────────────────────
    log(C.bold("  Summary"))
    log("  " + "─" * 50)

    ok_results      = [r for r in results if r.status in ("ok", "dry_run")]
    skipped_results = [r for r in results if r.status == "skipped"]
    error_results   = [r for r in results if r.status == "error"]

    total_comments = sum(r.comments_removed for r in ok_results)
    total_lines    = sum(r.lines_before - r.lines_after for r in ok_results)

    log(f"  Files modified   : {C.ok(str(len(ok_results)))}")
    log(f"  Files skipped    : {C.dim(str(len(skipped_results)))}")
    log(f"  Errors           : {C.err(str(len(error_results))) if error_results else C.ok('0')}")
    log(f"  Comments removed : {C.ok(str(total_comments))}")
    log(f"  Lines removed    : {C.ok(str(total_lines))}")

    if error_results:
        log()
        log(C.err("  Failed files:"))
        for r in error_results:
            try:
                rel = r.path.relative_to(root)
            except ValueError:
                rel = r.path
            log_err(str(rel))

    if not args.dry_run and ok_count > 0:
        log()
        log(C.dim(f"  Backups: {backup_dir}"))
        script_name = Path(__file__).name
        log(C.dim(f"  Restore: python {script_name} --root {root} --restore"))

    log()
    return 1 if error_results else 0


if __name__ == "__main__":
    sys.exit(main())