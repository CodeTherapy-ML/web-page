"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, UserRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

/**
 * Admin image field — the one upload control every CMS screen uses.
 *
 * Posts the file to /api/media (Cloudinary + a MediaAsset row, same route the
 * Media Library uses) and puts the returned secure URL into the named input,
 * so server actions keep receiving a plain string column. The URL stays
 * editable: pasting an existing asset URL still works.
 */
export default function ImageUploadField({
  name,
  label,
  defaultValue = "",
  required = false,
  hint,
  previewClassName,
  placeholder,
  className,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  /** Overrides the preview box size — defaults to a 144px-tall banner. */
  previewClassName?: string;
  /** `"avatar"` shows the person-glyph placeholder when no image is set —
   *  used by the team photo field, where a portrait is optional. */
  placeholder?: "avatar";
  className?: string;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "That file isn't an image", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Upload failed");
      setUrl(body.asset.url as string);
      toast({ title: "Image uploaded" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="text-xs font-semibold text-gray-600">{label}</span>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 transition-colors",
          dragging && "border-admin-azure bg-azure-soft",
          previewClassName,
        )}
      >
        {url && brokenSrc !== url ? (
          <Image
            src={url}
            alt=""
            fill
            sizes="320px"
            className="object-cover"
            onError={() => setBrokenSrc(url)}
          />
        ) : placeholder === "avatar" ? (
          <span className="flex flex-col items-center justify-center gap-2">
            <UserRound className="size-10 text-azure/50" strokeWidth={1.5} />
            <span className="px-3 text-center text-xs text-gray-400">
              No photo — the avatar placeholder is shown
            </span>
          </span>
        ) : (
          <span className="px-3 text-center text-xs text-gray-400">
            Drop an image here, or use Upload below
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-5 animate-spin text-admin-azure" />
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#1e293b] transition-colors hover:border-admin-azure hover:text-admin-azure disabled:opacity-60"
        >
          <ImagePlus className="size-4" />
          {uploading ? "Uploading…" : url ? "Replace Image" : "Upload Image"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        )}
      </div>

      <input
        name={name}
        required={required}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://res.cloudinary.com/… or paste a URL"
        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
