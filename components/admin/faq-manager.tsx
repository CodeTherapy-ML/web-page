"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteFaq, saveFaq, saveFaqCategory } from "@/app/admin/(portal)/faq/actions";
import { cn } from "@/lib/utils";
import DeleteButton from "@/components/admin/delete-button";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: string;
};

function SaveFaqButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-admin-azure px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function FaqManager({
  faqs,
  categories,
}: {
  faqs: Faq[];
  categories: string[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      {/* --------------------------------------------- question list */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {faqs.map((faq) => {
          const isOpen = open === faq.id;
          return (
            <div key={faq.id} className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 p-4">
                <GripVertical className="size-4 shrink-0 text-gray-300" aria-hidden />
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate font-semibold text-ink">
                    {faq.question}
                  </span>
                  <span className="text-xs text-gray-400">{faq.category}</span>
                </button>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-semibold",
                    faq.status === "published"
                      ? "bg-[#e2f4fd] text-admin-azure"
                      : "bg-[#e7ecf1] text-admin-navy",
                  )}
                >
                  {faq.status === "published" ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  aria-label={`Edit ${faq.question}`}
                  className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <DeleteButton
                  action={deleteFaq}
                  id={faq.id}
                  title="Delete this FAQ?"
                  description={faq.question}
                  ariaLabel={`Delete ${faq.question}`}
                  className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </DeleteButton>
              </div>

              {isOpen && (
                <form action={saveFaq} className="flex flex-col gap-3 border-t border-gray-100 p-4">
                  <input type="hidden" name="id" value={faq.id} />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-600">Question Input</span>
                    <input
                      name="question"
                      required
                      defaultValue={faq.question}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-600">Answer Rich-Text Area</span>
                    <textarea
                      name="answer"
                      required
                      rows={4}
                      defaultValue={faq.answer}
                      className="w-full resize-y rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-admin-azure"
                    />
                  </label>
                  <div className="flex items-end gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-600">Category</span>
                      <select
                        name="category"
                        defaultValue={faq.category}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
                      >
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-600">Display Order</span>
                      <input
                        type="number"
                        name="order"
                        min={1}
                        defaultValue={faq.order}
                        className="h-9 w-20 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-600">Status</span>
                      <select
                        name="status"
                        defaultValue={faq.status}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </label>
                    <div className="ml-auto">
                      <SaveFaqButton />
                    </div>
                  </div>
                </form>
              )}
            </div>
          );
        })}

        {adding ? (
          <form action={saveFaq} className="flex flex-col gap-3 rounded-xl border border-dashed border-admin-azure bg-[#f4f8fb] p-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Question Input</span>
              <input
                name="question"
                required
                placeholder="New question…"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Answer Rich-Text Area</span>
              <textarea
                name="answer"
                required
                rows={3}
                placeholder="Answer…"
                className="w-full resize-y rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-ink outline-none focus:border-admin-azure"
              />
            </label>
            <div className="flex items-end gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-600">Category</span>
                <select name="category" defaultValue={categories[0] ?? "General"} className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none">
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-600">Display Order</span>
                <input type="number" name="order" min={1} defaultValue={faqs.length + 1} className="h-9 w-20 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none" />
              </label>
              <input type="hidden" name="status" value="draft" />
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <SaveFaqButton />
              </div>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-admin-azure hover:text-admin-azure"
          >
            <Plus className="size-3.5" />
            Add Question
          </button>
        )}
      </div>

      {/* ------------------------------------------------ categories */}
      <aside className="flex w-full shrink-0 flex-col gap-3 xl:w-[280px]">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 font-bold text-ink">FAQ Categories</h2>
          <p className="mb-4 text-xs text-gray-400">
            These tags help filter FAQ items on the frontend site.
          </p>
          <ul className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <li
                key={cat}
                className="rounded-full bg-azure-soft px-3 py-1 text-xs font-semibold text-azure"
              >
                {cat}
              </li>
            ))}
          </ul>
          <form action={saveFaqCategory} className="mt-4 flex gap-2">
            <input
              name="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
              className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure"
            />
            <button
              type="submit"
              onClick={() => setNewCategory("")}
              className="shrink-0 rounded-lg bg-admin-azure px-3 text-xs font-semibold text-white transition-colors hover:bg-azure-deep"
            >
              Add
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
