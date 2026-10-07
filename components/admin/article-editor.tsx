"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { JsonValue } from "@prisma/client/runtime/library";
import { savePost } from "@/app/admin/(portal)/articles/actions";
import ImageUploadField from "@/components/admin/image-upload-field";
import RichEditor from "@/components/admin/rich-editor";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-admin-azure";
const labelClass = "text-[13px] font-semibold text-gray-600";

function SaveButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-[#1e293b] transition-colors hover:border-admin-azure hover:text-admin-azure disabled:opacity-60"
      >
        Save Draft
      </button>
      <button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
        className="rounded-lg bg-admin-azure px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
      >
        Publish Article
      </button>
    </div>
  );
}

export default function ArticleEditor({
  post,
}: {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    categoryTone: string;
    date: string;
    image: string;
    body: JsonValue;
    status: string;
    authorName: string;
    updatedAt: Date;
  } | null;
}) {
  const [state, formAction] = useFormState(savePost, { error: null });
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  
  return (
    <form action={formAction} className="flex flex-col gap-6 p-6">
      {post && <input type="hidden" name="id" value={post.id} />}


      {/* ---------------------------------------------------- header */}
      <header className="flex flex-col gap-4">
        <nav className="flex items-center gap-1.5 text-sm">
          <Link
            href="/admin/articles"
            className="font-semibold text-admin-azure hover:underline"
          >
            Back to Articles
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{title || "Untitled"}</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-ink">Edit Article</h1>
          <SaveButtons />
        </div>
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {state.error}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* -------------------------------------------------- main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Article Title</span>
              <input
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-lg font-semibold text-ink outline-none focus:border-admin-azure"
              />
            </label>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className={labelClass}>Excerpt</span>
              <textarea
                name="excerpt"
                required
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-admin-azure"
              />
            </label>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Content</h2>
            <RichEditor content={post?.body} name="contentHtml" />
          </section>
        </div>

        {/* ------------------------------------------------- sidebar */}
        <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-[340px]">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Publish Settings</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Status</span>
                <input
                  name="status-display"
                  readOnly
                  value={
                    post?.status === "underReview"
                      ? "Under Review"
                      : post?.status === "draft"
                        ? "Draft"
                        : "Published"
                  }
                  className={cn(inputClass, "bg-gray-50 text-gray-500")}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Publication Date</span>
                <input
                  name="date"
                  required
                  defaultValue={post?.date}
                  placeholder="July 20, 2025"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Author</span>
                <input
                  name="authorName"
                  required
                  defaultValue={post?.authorName ?? "CodeTherapy"}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Categories &amp; Tags</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Category</span>
                <input
                  name="category"
                  required
                  defaultValue={post?.category}
                  placeholder="Announcement"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Tone</span>
                <select
                  name="categoryTone"
                  defaultValue={post?.categoryTone ?? "sage"}
                  className={inputClass}
                >
                  <option value="sage">Azure</option>
                  <option value="clay">Navy</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Featured Image</h2>
            <ImageUploadField
              name="image"
              required
              defaultValue={post?.image}
              hint="Recommended size: 1200×630px."
            />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">SEO Settings</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>URL Slug</span>
                <div className="flex items-center">
                  <span className="rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    /blog/
                  </span>
                  <input
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="h-10 w-full rounded-r-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none focus:border-admin-azure"
                  />
                </div>
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="truncate text-sm font-semibold text-admin-azure">
                  {title || "Article title"} - CodeTherapy
                </p>
                <p className="truncate text-xs text-ink-soft">
                  https://codetherapy.ml/blog/{slug || "…"}
                </p>
                <p className="line-clamp-2 text-xs text-gray-500">
                  {excerpt || "Search preview description…"}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
