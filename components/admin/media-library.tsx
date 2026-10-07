"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, FileText, LayoutGrid, List, Play, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cleanupUnusedAssets } from "@/app/admin/(portal)/media/actions";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/admin/confirm-dialog";

type Asset = {
  id: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  type: string;
  dimensions: string | null;
  uploadedBy: string | null;
  /** Referenced by at least one content column (body, hero, card image…). */
  used: boolean;
  createdAt: Date;
  alt: string | null;
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function MediaLibrary({ assets }: { assets: Asset[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const selected = assets.find((a) => a.id === selectedId) ?? assets[0];

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/media", { method: "POST", body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Upload failed");
        }
      } catch (e) {
        toast({
          title: "Upload failed",
          description: e instanceof Error ? e.message : "Please try again.",
          variant: "destructive",
        });
        break;
      }
    }
    setUploading(false);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast({ title: "Delete failed", variant: "destructive" });
      return;
    }
    if (selectedId === id) setSelectedId(null);
    toast({ title: "File deleted" });
    router.refresh();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    toast({ title: "URL copied" });
  }

  const unusedCount = assets.filter((a) => !a.used).length;

  async function cleanupUnused() {
    const removed = await cleanupUnusedAssets();
    toast({
      title:
        removed > 0
          ? `${removed} unused file${removed === 1 ? "" : "s"} deleted`
          : "Nothing to clean up",
      description:
        removed > 0
          ? "Removed from Cloudinary and the library."
          : "Every asset is referenced somewhere.",
    });
    router.refresh();
  }

  const stats = {
    total: assets.length,
    images: assets.filter((a) => a.type === "image").length,
    videos: assets.filter((a) => a.type === "video").length,
    documents: assets.filter((a) => a.type === "document").length,
    bytes: assets.reduce((sum, a) => sum + a.size, 0),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --------------------------------------------- upload row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Select a file to see its details; uploads land in Cloudinary.
        </p>
        <div className="flex gap-2">
          {unusedCount > 0 && (
            <button
              type="button"
              onClick={() => setConfirmCleanup(true)}
              className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete {unusedCount} unused file{unusedCount === 1 ? "" : "s"}
            </button>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
          >
            <Upload className="size-4" />
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ stats bar */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 bg-white px-4 py-4 text-[13px] text-gray-600">
        <span>
          Total Files: <strong className="text-ink">{stats.total}</strong>
        </span>
        <span className="h-4 w-px bg-gray-200" aria-hidden />
        <span>
          Images: <strong className="text-ink">{stats.images}</strong>
        </span>
        <span className="h-4 w-px bg-gray-200" aria-hidden />
        <span>
          Videos: <strong className="text-ink">{stats.videos}</strong>
        </span>
        <span className="h-4 w-px bg-gray-200" aria-hidden />
        <span>
          Documents: <strong className="text-ink">{stats.documents}</strong>
        </span>
        <span className="ml-auto flex items-center gap-3">
          Storage Used: {formatBytes(stats.bytes)} / 10 GB
          <span className="h-1.5 w-[140px] overflow-hidden rounded bg-gray-100">
            <span
              className="block h-full rounded bg-admin-azure"
              style={{ width: `${Math.min(100, (stats.bytes / (10 * 1024 * 1024 * 1024)) * 100)}%` }}
            />
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* ---------------------------------------------- grid */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-600">
                Type: All
              </span>
              <span className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-600">
                Date: Any time
              </span>
            </div>
            <div className="flex gap-2">
              <span className="hidden h-9 w-[200px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 md:flex">
                <span className="text-[13px] text-gray-400">Search files...</span>
              </span>
              <div className="flex gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={cn("rounded-md p-1.5", view === "grid" && "bg-gray-100")}
                >
                  <LayoutGrid className="size-3.5 text-gray-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={cn("rounded-md p-1.5", view === "list" && "bg-gray-100")}
                >
                  <List className="size-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedId(asset.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border bg-white p-2 text-left transition-colors",
                    selectedId === asset.id ? "border-2 border-admin-azure" : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <span className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-azure-soft">
                    {asset.type === "image" ? (
                      <Image
                        src={asset.url}
                        alt=""
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    ) : asset.type === "video" ? (
                      <Play className="size-4 text-gray-500" />
                    ) : (
                      <FileText className="size-4 text-gray-500" />
                    )}
                  </span>
                  <span className="flex w-full flex-col gap-0.5 px-1 pb-1">
                    <span className="flex items-center justify-between gap-1">
                      <span className="truncate text-[13px] font-semibold text-ink">
                        {asset.publicId.split("/").pop()}.{asset.format}
                      </span>
                      {!asset.used && (
                        <span className="shrink-0 rounded bg-[#e7ecf1] px-1.5 py-0.5 text-[10px] font-bold uppercase text-admin-navy">
                          Unused
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {formatBytes(asset.size)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col rounded-xl border border-gray-200 bg-white">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 last:border-0"
                >
                  <FileText className="size-4 text-gray-400" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                    {asset.publicId.split("/").pop()}.{asset.format}
                  </span>
                  <span className="text-xs text-gray-500">{formatBytes(asset.size)}</span>
                </div>
              ))}
            </div>
          )}

          {assets.length === 0 && (
            <p className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              No files yet — upload the first one.
            </p>
          )}

          <p className="pt-3 text-[13px] text-gray-500">
            Showing 1-{assets.length} of {assets.length} files
          </p>
        </div>

        {/* -------------------------------------------- file details */}
        <aside className="flex w-full shrink-0 flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 xl:w-[300px]">
          <h2 className="font-bold text-ink">File Details</h2>
          {selected ? (
            <>
              <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden rounded-lg bg-azure-soft">
                {selected.type === "image" ? (
                  <Image
                    src={selected.url}
                    alt={selected.alt ?? ""}
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                ) : selected.type === "video" ? (
                  <Play className="size-10 text-gray-400" />
                ) : (
                  <FileText className="size-10 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-3 text-[13px]">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">File Name</p>
                  <p className="truncate font-semibold text-ink">
                    {selected.publicId.split("/").pop()}.{selected.format}
                  </p>
                </div>
                {selected.dimensions && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Dimensions</p>
                    <p className="text-gray-600">{selected.dimensions}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">File Size</p>
                  <p className="text-gray-600">{formatBytes(selected.size)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Uploaded By</p>
                  <p className="text-gray-600">{selected.uploadedBy ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Usage</p>
                  <p
                    className={
                      "text-[13px] font-semibold " +
                      (selected.used ? "text-admin-azure" : "text-admin-navy")
                    }
                  >
                    {selected.used ? "Referenced in content" : "Unused — safe to delete"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Upload Date</p>
                  <p className="text-gray-600">
                    {selected.createdAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(selected.url)}
                  className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure"
                >
                  <Copy className="size-3.5" />
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-red-600 bg-[#fee2e2] text-[13px] font-semibold text-red-600 transition-colors hover:bg-[#fecaca]"
                >
                  <Trash2 className="size-3.5" />
                  Delete File
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Select a file to see its details.</p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this file?"
        description={
          selected?.alt || selected?.url
            ? `"${selected.alt || selected.url}" is removed from Cloudinary and the library.`
            : undefined
        }
        pending={deletePending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setDeletePending(true);
          try {
            await remove(selected.id);
          } finally {
            setDeletePending(false);
            setConfirmDelete(false);
          }
        }}
      />
      <ConfirmDialog
        open={confirmCleanup}
        title={`Delete ${unusedCount} unused file${unusedCount === 1 ? "" : "s"}?`}
        description="Files referenced by no project, article or page are removed from Cloudinary and the library."
        pending={deletePending}
        onCancel={() => setConfirmCleanup(false)}
        onConfirm={async () => {
          setDeletePending(true);
          try {
            await cleanupUnused();
          } finally {
            setDeletePending(false);
            setConfirmCleanup(false);
          }
        }}
      />

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="sr-only"
      >
        Upload
      </button>
    </div>
  );
}
