"use client";

import { useRef, useState } from "react";
import type { JsonValue } from "@prisma/client/runtime/library";
import { useEditor, EditorContent } from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import LinkExtension from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import {
  Bold,
  Film,
  ImagePlus,
  Italic,
  List,
  Minus,
  PaintBucket,
  Palette,
  Plus,
  Quote,
  Redo2,
  Table as TableIcon,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

/** HTML5 <video> node for files uploaded to Cloudinary. */
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: "true" },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes)];
  },
  addCommands() {
    return {
      insertVideo:
        (src: string) =>
        ({ commands }: { commands: { insertContent: (c: unknown) => unknown } }) =>
          commands.insertContent({ type: this.name, attrs: { src } }),
    } as never;
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      insertVideo: (src: string) => ReturnType;
    };
  }
}

/** TableCell + a `background` attribute so cell colours can be set. */
const ColoredTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      background: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-background") || element.style.backgroundColor || null,
        renderHTML: (attributes: { background?: string | null }) =>
          attributes.background
            ? { "data-background": attributes.background, style: `background-color: ${attributes.background}` }
            : {},
      },
    };
  },
});

const TEXT_COLORS = [
  "#0d1117", // ink
  "#45586a", // ink-soft
  "#00719d", // azure
  "#00aeef", // azure-bright (the logo cyan)
  "#0b3c5d", // navy
  "#dc2626",
  "#f59e0b",
  "#6b7280",
];
const CELL_COLORS = [
  "#ffffff",
  "#e2f4fd", // azure-soft
  "#cbe9fa", // azure tint, one step up
  "#e7ecf1", // navy-soft
  "#f4f8fb", // cream
  "#fef3c7",
  "#fee2e2",
  "#f3f4f6",
];

/**
 * Shared rich-text editor for the CMS content areas — toolbar per the
 * cms-article-editor frame, plus image/video embeds (URL paste or Cloudinary
 * upload), tables, and text / cell colour.
 * Renders a hidden input named `name` carrying the TipTap HTML.
 */
function initialContent(body: JsonValue | null | undefined): string {
  if (typeof body === "string") return body;
  if (Array.isArray(body)) {
    const paragraphs = body.filter((x): x is string => typeof x === "string");
    return paragraphs.map((p) => `<p>${p}</p>`).join("");
  }
  return "";
}

const toolbarButton =
  "rounded p-1.5 text-gray-600 transition-colors hover:bg-white";

export default function RichEditor({
  content,
  name,
}: {
  content: JsonValue | null | undefined;
  name: string;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState("");
  const [embedMode, setEmbedMode] = useState<"image" | "video" | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [colorPanel, setColorPanel] = useState<"text" | "cell" | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Youtube.configure({ controls: true }),
      Video,
      TextStyle,
      Color,
      // v3's TableView ships drag-to-resize column handles natively.
      Table.configure({ resizable: true, cellMinWidth: 40 }),
      TableRow,
      TableHeader,
      ColoredTableCell,
    ],
    content: initialContent(content),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] w-full rounded-b-lg border border-t-0 border-gray-200 bg-white px-4 py-3 text-sm text-ink outline-none focus-visible:border-admin-azure [&_img]:rounded-lg [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_video]:w-full [&_video]:rounded-lg [&_.tableWrapper]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-1.5 [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-1.5",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  const activeTextColor = editor?.getAttributes("textStyle").color as string | undefined;
  const activeCellColor = editor?.getAttributes("tableCell").background as
    | string
    | undefined;

  function insertEmbed() {
    const url = embedUrl.trim();
    if (!editor || !url) return;
    if (embedMode === "image") {
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
    } else {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
    setEmbedUrl("");
    setEmbedMode(null);
  }

  /** File upload → Cloudinary via /api/media → insert the returned URL. */
  async function uploadAndInsert(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Upload failed");
      }
      const { asset } = await res.json();

      if (file.type.startsWith("video/")) {
        editor.chain().focus().insertVideo(asset.url as string).run();
      } else {
        editor.chain().focus().setImage({ src: asset.url as string, alt: "" }).run();
      }
      setEmbedMode(null);
      toast({ title: "Media uploaded and embedded" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const inTable = editor?.isActive("table");

  return (
    <div className="relative">
      <input
        type="hidden"
        name={name}
        value={html || initialContent(content)}
      />

      {/* -------------------------------------------------------- toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-gray-200 bg-gray-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor?.chain().focus().setParagraph().run()}
          title="Paragraph"
          className={cn(
            "rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-white",
            editor?.isActive("paragraph") && "bg-white text-admin-azure shadow-sm",
          )}
        >
          ¶
        </button>
        {([1, 2, 3] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            title={`Heading ${level}`}
            className={cn(
              "rounded px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white",
              editor?.isActive("heading", { level }) &&
                "bg-white text-admin-azure shadow-sm",
            )}
          >
            H{level}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-label="Bold"
          className={cn(toolbarButton, editor?.isActive("bold") && "bg-white text-admin-azure shadow-sm")}
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-label="Italic"
          className={cn(toolbarButton, editor?.isActive("italic") && "bg-white text-admin-azure shadow-sm")}
        >
          <Italic className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
          className={cn(toolbarButton, editor?.isActive("bulletList") && "bg-white text-admin-azure shadow-sm")}
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          aria-label="Blockquote"
          className={cn(toolbarButton, editor?.isActive("blockquote") && "bg-white text-admin-azure shadow-sm")}
        >
          <Quote className="size-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />

        {/* ------------------------------------------------------ table */}
        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="Insert table"
          className={cn(toolbarButton, inTable && "bg-white text-admin-azure shadow-sm")}
        >
          <TableIcon className="size-3.5" />
        </button>
        {inTable && (
          <>
            <button
              type="button"
              onClick={() => editor?.chain().focus().addRowAfter().run()}
              title="Add row"
              className={toolbarButton}
            >
              <Plus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
              title="Add column"
              className={toolbarButton}
            >
              <span className="text-[11px] font-bold leading-none">+Col</span>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().deleteTable().run()}
              title="Delete table"
              className={cn(toolbarButton, "hover:text-red-600")}
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        )}
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />

        {/* ----------------------------------------------------- colour */}
        <button
          type="button"
          onClick={() => setColorPanel(colorPanel === "text" ? null : "text")}
          title="Text colour"
          aria-label="Text colour"
          className={cn(
            toolbarButton,
            (colorPanel === "text" || activeTextColor) && "bg-white text-admin-azure shadow-sm",
          )}
        >
          <Palette className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setColorPanel(colorPanel === "cell" ? null : "cell")}
          title="Cell background"
          aria-label="Cell background"
          className={cn(
            toolbarButton,
            (colorPanel === "cell" || activeCellColor) && "bg-white text-admin-azure shadow-sm",
          )}
        >
          <PaintBucket className="size-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />

        {/* ------------------------------------------------------ media */}
        <button
          type="button"
          onClick={() => {
            setEmbedMode(embedMode === "image" ? null : "image");
            setEmbedUrl("");
          }}
          aria-label="Embed image"
          title="Embed image (URL or upload)"
          className={cn(toolbarButton, embedMode === "image" && "bg-white text-admin-azure shadow-sm")}
        >
          <ImagePlus className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setEmbedMode(embedMode === "video" ? null : "video");
            setEmbedUrl("");
          }}
          aria-label="Embed video"
          title="Embed video (YouTube/Vimeo URL or upload)"
          className={cn(toolbarButton, embedMode === "video" && "bg-white text-admin-azure shadow-sm")}
        >
          <Film className="size-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />

        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          aria-label="Undo"
          className={toolbarButton}
        >
          <Undo2 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          aria-label="Redo"
          className={toolbarButton}
        >
          <Redo2 className="size-3.5" />
        </button>
      </div>

      {/* ------------------------------------------------ colour panel */}
      {colorPanel && (
        <div className="absolute left-2 top-12 z-20 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">
              {colorPanel === "text" ? "Text colour" : "Cell background"}
            </span>
            <button
              type="button"
              onClick={() => setColorPanel(null)}
              aria-label="Close colour panel"
              className="rounded p-0.5 text-gray-400 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(colorPanel === "text" ? TEXT_COLORS : CELL_COLORS).map((color) => {
              const active =
                colorPanel === "text" ? activeTextColor === color : activeCellColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    if (colorPanel === "text") {
                      editor?.chain().focus().setColor(color).run();
                    } else {
                      editor?.chain().focus().setCellAttribute("background", color).run();
                    }
                  }}
                  aria-label={`${colorPanel === "text" ? "Text" : "Cell"} colour ${color}`}
                  className={cn(
                    "size-6 rounded border border-gray-200",
                    active && "ring-2 ring-admin-azure ring-offset-1",
                  )}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              if (colorPanel === "text") {
                editor?.chain().focus().unsetColor().run();
              } else {
                editor?.chain().focus().setCellAttribute("background", "transparent").run();
              }
            }}
            className="text-left text-xs font-semibold text-gray-500 hover:text-admin-azure"
          >
            Reset {colorPanel === "text" ? "text" : "cell"} colour
          </button>
        </div>
      )}

      {/* ---------------------------------------------- embed URL + upload bar */}
      {embedMode && (
        <div className="flex items-center gap-2 border border-t-0 border-gray-200 bg-white px-2 py-2">
          <span className="shrink-0 text-xs font-semibold text-gray-500">
            {embedMode === "image" ? "Image" : "Video"}
          </span>
          <input
            autoFocus
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insertEmbed();
              }
              if (e.key === "Escape") setEmbedMode(null);
            }}
            placeholder={
              embedMode === "image"
                ? "Paste image URL — https://…/image.png"
                : "Paste YouTube/Vimeo URL — or upload a video file"
            }
            className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
          />
          <button
            type="button"
            onClick={insertEmbed}
            className="shrink-0 rounded-lg bg-admin-azure px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-azure-deep"
          >
            Insert
          </button>
          <span className="text-xs text-gray-300">or</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure disabled:opacity-60"
          >
            <Upload className="size-3.5" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => setEmbedMode(null)}
            aria-label="Cancel embed"
            className="rounded p-1.5 text-gray-400 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          uploadAndInsert(e.target.files);
        }}
      />

      <EditorContent editor={editor} />
    </div>
  );
}
