import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory sorgente (percorso assoluto al progetto principale)
// const ROOT_DIR = "/Users/samuelepatti/client-last-bigster/components";
const ROOT_DIR = "/Users/samuelepatti/client-last-bigster";

const OUTPUT_FILE = path.join(__dirname, "output.txt"); // Output nella stessa cartella del file

// Directory e file da escludere
const EXCLUDED_DIRS = ["node_modules", ".git", "dist", "build"];
const EXCLUDED_FILES = [
  "package-lock.json",
  "yarn.lock",
  "package.json",
  "output.txt",
  path.basename(__filename),
];

// File extensions to include (add more as needed)
const VALID_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".md",
  ".scss",
];

// Raccoglie tutti i file ricorsivamente
async function getAllFiles(dirPath) {
  let entries = await fs.readdir(dirPath, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Escludi cartelle definite in EXCLUDED_DIRS
      if (EXCLUDED_DIRS.includes(entry.name)) continue;
      // Escludi tutte le cartelle che iniziano con "." (cartelle nascoste)
      if (entry.name.startsWith(".")) continue;
      files = files.concat(await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

// Verifica se il file deve essere incluso nel merge
function shouldIncludeFile(filePath) {
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath);

  // Escludi i file specificati
  if (EXCLUDED_FILES.includes(fileName)) return false;

  // Escludi i file .bak
  if (fileName.endsWith(".bak")) return false;

  // ✅ Includi solo i file .test.ts
  if (fileName.endsWith(".test.ts")) return false;

  // Includi solo file con estensioni valide
  if (!VALID_EXTENSIONS.includes(extension)) return false;

  return true;
}

// Elimina tutti i file .bak
async function deleteBakFiles(files) {
  const bakFiles = files.filter((file) => file.endsWith(".bak"));
  for (const file of bakFiles) {
    await fs.unlink(file);
    console.log(`🗑️  Eliminato: ${file}`);
  }
}

// Esegue il merge di tutti i file validi
async function mergeAllFiles(files) {
  let mergedContent = "";
  let mergedFilesCount = 0;

  // Ordina i file per percorso per una migliore leggibilità
  files.sort();

  for (const file of files) {
    if (!shouldIncludeFile(file)) continue;

    try {
      const content = await fs.readFile(file, "utf8");
      const relativePath = path.relative(ROOT_DIR, file);

      mergedContent += `\n\n// ===== ${relativePath} =====\n\n${content}`;
      mergedFilesCount++;

      console.log(`✓ Aggiunto: ${relativePath}`);
    } catch (err) {
      console.error(`❌ Errore nella lettura di ${file}: ${err.message}`);
    }
  }

  await fs.writeFile(OUTPUT_FILE, mergedContent);
  console.log(`\n✅ File unificato generato con successo: ${OUTPUT_FILE}`);
  console.log(`📊 Totale file uniti: ${mergedFilesCount}`);
}

// Procedura principale
async function run() {
  try {
    console.log("🔍 Ricerca di tutti i file...");
    const allFiles = await getAllFiles(ROOT_DIR);

    console.log("🧹 Pulizia dei file .bak...");
    await deleteBakFiles(allFiles);

    console.log("🔄 Unione dei file in corso...");
    await mergeAllFiles(allFiles);
  } catch (err) {
    console.error("❌ Errore critico:", err);
  }
}

run();
