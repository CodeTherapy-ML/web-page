"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { bulkDelete, bulkSetStatus } from "@/app/admin/(portal)/articles/actions";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/admin/confirm-dialog";

type Row = {
  id: string;
  title: string;
  authorName: string;
  category: string;
  status: string;
  date: string;
  image: string;
};

const statusPill: Record<string, string> = {
  published: "bg-[#e2f4fd] text-admin-azure",
  underReview: "bg-[#cbe9fa] text-admin-azure",
  draft: "bg-[#e7ecf1] text-admin-navy",
};
const statusLabel: Record<string, string> = {
  published: "Published",
  underReview: "Under Review",
  draft: "Draft",
};

export default function ArticlesTable({ posts }: { posts: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("published");
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = posts.length > 0 && selected.size === posts.length;

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-admin-azure/30 bg-[#e2f4fd] px-4 py-2.5">
          <p className="text-sm font-semibold text-admin-azure">
            {selected.size} article{selected.size === 1 ? "" : "s"} selected
          </p>
          <form className="flex items-center gap-3">
            <input
              type="hidden"
              name="ids"
              value={JSON.stringify(Array.from(selected))}
            />
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Change status"
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-ink outline-none focus:border-admin-azure"
            >
              <option value="published">Published</option>
              <option value="underReview">Under Review</option>
              <option value="draft">Draft</option>
            </select>
            <button
              formAction={bulkSetStatus}
              className="rounded-lg border border-admin-azure px-3 py-1.5 text-xs font-semibold text-admin-azure transition-colors hover:bg-admin-azure hover:text-white"
            >
              Change Status
            </button>
            <button
              type="button"
              onClick={() => setConfirmBulk(true)}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Delete Selected
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={confirmBulk}
        title={`Delete ${selected.size} article${selected.size === 1 ? "" : "s"}?`}
        description="The articles are removed from the blog and search engines will 404. This cannot be undone."
        pending={bulkPending}
        onCancel={() => setConfirmBulk(false)}
        onConfirm={async () => {
          setBulkPending(true);
          const fd = new FormData();
          fd.set("ids", JSON.stringify(Array.from(selected)));
          try {
            await bulkDelete(fd);
            setSelected(new Set());
          } finally {
            setBulkPending(false);
            setConfirmBulk(false);
          }
        }}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? new Set() : new Set(posts.map((p) => p.id)))
                  }
                  aria-label="Select all articles"
                  className="size-4 rounded accent-admin-azure"
                />
              </th>
              <th className="px-2 py-3">Thumb</th>
              <th className="px-2 py-3">Article Title</th>
              <th className="px-2 py-3">Author</th>
              <th className="px-2 py-3">Category</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggle(post.id)}
                    aria-label={`Select ${post.title}`}
                    className="size-4 rounded accent-admin-azure"
                  />
                </td>
                <td className="px-2 py-3">
                  <span className="relative block size-12 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                </td>
                <td className="max-w-[260px] truncate px-2 py-3 font-semibold text-ink">
                  {post.title}
                </td>
                <td className="px-2 py-3 text-gray-500">{post.authorName}</td>
                <td className="px-2 py-3 text-gray-500">{post.category}</td>
                <td className="px-2 py-3">
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-semibold",
                      statusPill[post.status] ?? "bg-gray-100 text-gray-500",
                    )}
                  >
                    {statusLabel[post.status] ?? post.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-gray-500">{post.date}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/articles/${post.id}`}
                      aria-label={`Edit ${post.title}`}
                      className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-ink"
                    >
                      <Edit3 className="size-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  No articles in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
