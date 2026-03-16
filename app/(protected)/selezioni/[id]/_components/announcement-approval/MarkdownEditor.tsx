"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Minus,
  Eye,
  Edit3,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: () => void;
  wrap?: { before: string; after: string };
  insert?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Scrivi il contenuto dell'annuncio...",
  disabled = false,
  minHeight = "400px",
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    },
    [value, onChange]
  );

  const insertAtLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;

      const newText =
        value.substring(0, lineStart) + prefix + value.substring(lineStart);

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length
        );
      }, 0);
    },
    [value, onChange]
  );

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: Bold,
      label: "Grassetto",
      action: () => insertText("**", "**"),
    },
    {
      icon: Italic,
      label: "Corsivo",
      action: () => insertText("*", "*"),
    },
    {
      icon: Heading1,
      label: "Titolo 1",
      action: () => insertAtLineStart("# "),
    },
    {
      icon: Heading2,
      label: "Titolo 2",
      action: () => insertAtLineStart("## "),
    },
    {
      icon: Heading3,
      label: "Titolo 3",
      action: () => insertAtLineStart("### "),
    },
    {
      icon: List,
      label: "Lista puntata",
      action: () => insertAtLineStart("- "),
    },
    {
      icon: ListOrdered,
      label: "Lista numerata",
      action: () => insertAtLineStart("1. "),
    },
    {
      icon: CheckSquare,
      label: "Checklist",
      action: () => insertAtLineStart("- [ ] "),
    },
    {
      icon: Quote,
      label: "Citazione",
      action: () => insertAtLineStart("> "),
    },
    {
      icon: Code,
      label: "Codice",
      action: () => insertText("`", "`"),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertText("[", "](url)"),
    },
    {
      icon: Minus,
      label: "Linea orizzontale",
      action: () => insertText("\n---\n", ""),
    },
  ];

  return (
    <div className="border border-bigster-border bg-bigster-surface">

      <div className="flex items-center justify-between px-3 py-2 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.action}
              disabled={disabled || isPreview}
              title={button.label}
              className="p-1.5 hover:bg-bigster-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <button.icon className="h-4 w-4 text-bigster-text" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${
              !isPreview
                ? "bg-bigster-primary text-bigster-primary-text"
                : "text-bigster-text-muted hover:bg-bigster-muted-bg"
            }`}
          >
            <Edit3 className="h-3 w-3" />
            Modifica
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${
              isPreview
                ? "bg-bigster-primary text-bigster-primary-text"
                : "text-bigster-text-muted hover:bg-bigster-muted-bg"
            }`}
          >
            <Eye className="h-3 w-3" />
            Anteprima
          </button>
        </div>
      </div>

      <div style={{ minHeight }}>
        {isPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none overflow-auto"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-bigster-text-muted italic">
                Nessun contenuto da visualizzare
              </p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-4 bg-bigster-surface text-bigster-text placeholder:text-bigster-text-muted focus:outline-none resize-none font-mono text-sm"
            style={{ minHeight }}
          />
        )}
      </div>

      <div className="px-3 py-2 border-t border-bigster-border bg-bigster-card-bg">
        <p className="text-xs text-bigster-text-muted">
          Supporta sintassi Markdown: **grassetto**, *corsivo*, # titoli, -
          liste, [link](url)
        </p>
      </div>
    </div>
  );
}
