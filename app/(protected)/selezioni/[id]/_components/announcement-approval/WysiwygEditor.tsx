"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Minus,
  Undo,
  Redo,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import TurndownService from "turndown";
import { marked } from "marked";

interface WysiwygEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
});

turndownService.addRule("underline", {
  filter: ["u"],
  replacement: function (content) {
    return `<u>${content}</u>`;
  },
});

marked.setOptions({
  breaks: true,
  gfm: true,
});

function markdownToHtml(markdown: string): string {
  if (!markdown) return "<p></p>";

  try {
    const html = marked.parse(markdown, { async: false }) as string;
    return html;
  } catch (error) {
    console.error("Errore parsing markdown:", error);
    return `<p>${markdown}</p>`;
  }
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 transition-all duration-150
        ${
          isActive
            ? "bg-bigster-primary text-bigster-primary-text shadow-sm"
            : "bg-transparent hover:bg-bigster-muted-bg text-bigster-text"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-bigster-border mx-1" />;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Scrivi il contenuto dell'annuncio...",
  disabled = false,
  minHeight = "400px",
}: WysiwygEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [, forceUpdate] = useState(0);
  const isInternalChange = useRef(false);
  const lastExternalValue = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: markdownToHtml(value),
    editable: !disabled,
    onUpdate: ({ editor }) => {
      if (disabled) return;

      isInternalChange.current = true;
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);

      setTimeout(() => {
        isInternalChange.current = false;
      }, 100);
    },
    onSelectionUpdate: () => {

      forceUpdate((n) => n + 1);
    },
    onTransaction: () => {

      forceUpdate((n) => n + 1);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (isInternalChange.current) return;

    if (value === lastExternalValue.current) return;

    const currentHtml = editor.getHTML();
    const currentMarkdown = turndownService.turndown(currentHtml);

    if (value !== currentMarkdown) {
      const newHtml = markdownToHtml(value);
      editor.commands.setContent(newHtml, { emitUpdate: false });
    }

    lastExternalValue.current = value;
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return (
      <div
        className="border border-bigster-border bg-bigster-surface animate-pulse"
        style={{ minHeight }}
      >
        <div className="h-12 bg-bigster-card-bg border-b border-bigster-border" />
        <div className="p-4">
          <div className="h-4 bg-bigster-muted-bg w-3/4 mb-2 rounded" />
          <div className="h-4 bg-bigster-muted-bg w-1/2 rounded" />
        </div>
      </div>
    );
  }

  const isBold = editor.isActive("bold");
  const isItalic = editor.isActive("italic");
  const isUnderline = editor.isActive("underline");
  const isH1 = editor.isActive("heading", { level: 1 });
  const isH2 = editor.isActive("heading", { level: 2 });
  const isH3 = editor.isActive("heading", { level: 3 });
  const isBulletList = editor.isActive("bulletList");
  const isOrderedList = editor.isActive("orderedList");
  const isBlockquote = editor.isActive("blockquote");
  const isLink = editor.isActive("link");

  return (
    <div
      className={`border bg-bigster-surface ${
        disabled ? "border-bigster-border opacity-75" : "border-bigster-border"
      }`}
    >

      <div
        className={`flex items-center flex-wrap gap-0.5 px-2 py-2 border-b border-bigster-border ${
          disabled ? "bg-bigster-muted-bg" : "bg-bigster-card-bg"
        }`}
      >

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Annulla (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Ripristina (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={isBold}
          disabled={disabled}
          title="Grassetto (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={isItalic}
          disabled={disabled}
          title="Corsivo (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={isUnderline}
          disabled={disabled}
          title="Sottolineato (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={isH1}
          disabled={disabled}
          title="Titolo 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={isH2}
          disabled={disabled}
          title="Titolo 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={isH3}
          disabled={disabled}
          title="Titolo 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={isBulletList}
          disabled={disabled}
          title="Lista puntata"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={isOrderedList}
          disabled={disabled}
          title="Lista numerata"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={isBlockquote}
          disabled={disabled}
          title="Citazione"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          title="Linea orizzontale"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {showLinkInput ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="h-8 px-2 text-sm border border-bigster-border bg-bigster-surface text-bigster-text focus:outline-none focus:border-bigster-text w-48 rounded-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setLink();
                }
                if (e.key === "Escape") {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={setLink}
              className="h-8 px-3 bg-bigster-primary text-bigster-primary-text text-xs font-semibold rounded-none"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="h-8 px-2 bg-bigster-muted-bg text-bigster-text text-xs rounded-none"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <ToolbarButton
              onClick={() => {
                const previousUrl = editor.getAttributes("link").href || "";
                setLinkUrl(previousUrl);
                setShowLinkInput(true);
              }}
              isActive={isLink}
              disabled={disabled}
              title="Inserisci link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            {isLink && (
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={disabled}
                title="Rimuovi link"
              >
                <Unlink className="h-4 w-4" />
              </ToolbarButton>
            )}
          </>
        )}

        <div className="ml-auto flex items-center gap-1 px-2">
          {isBold && (
            <span className="px-1.5 py-0.5 bg-bigster-primary text-bigster-primary-text text-[10px] font-bold">
              B
            </span>
          )}
          {isItalic && (
            <span className="px-1.5 py-0.5 bg-bigster-primary text-bigster-primary-text text-[10px] font-bold italic">
              I
            </span>
          )}
          {isUnderline && (
            <span className="px-1.5 py-0.5 bg-bigster-primary text-bigster-primary-text text-[10px] font-bold underline">
              U
            </span>
          )}
          {isH1 && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold">
              H1
            </span>
          )}
          {isH2 && (
            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold">
              H2
            </span>
          )}
          {isH3 && (
            <span className="px-1.5 py-0.5 bg-blue-400 text-white text-[10px] font-bold">
              H3
            </span>
          )}
          {isBulletList && (
            <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-bold">
              •
            </span>
          )}
          {isOrderedList && (
            <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold">
              1.
            </span>
          )}
          {isBlockquote && (
            <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold">
              "
            </span>
          )}
          {isLink && (
            <span className="px-1.5 py-0.5 bg-blue-700 text-white text-[10px] font-bold">
              🔗
            </span>
          )}
        </div>
      </div>


      <div className={disabled ? "pointer-events-none" : ""}>
        <EditorContent
          editor={editor}
          className="wysiwyg-editor"
          style={{ minHeight }}
        />
      </div>


      <div className="px-3 py-2 border-t border-bigster-border bg-bigster-card-bg flex items-center justify-between">
        <p className="text-xs text-bigster-text-muted">
          Ctrl+B grassetto · Ctrl+I corsivo · Ctrl+U sottolineato · Ctrl+Z
          annulla
        </p>
        {disabled && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5">
            Sola lettura
          </span>
        )}
      </div>
    </div>
  );
}
