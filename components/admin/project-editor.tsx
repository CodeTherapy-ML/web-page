"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { JsonValue } from "@prisma/client/runtime/library";
import { saveProject } from "@/app/admin/(portal)/projects/actions";
import ImageUploadField from "@/components/admin/image-upload-field";
import RichEditor from "@/components/admin/rich-editor";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/admin/confirm-dialog";

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-admin-azure";
const labelClass = "text-[13px] font-semibold text-gray-600";

function PublishButtons() {
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
        Publish Changes
      </button>
    </div>
  );
}

export default function ProjectEditor({
  project,
}: {
  project?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    tag: string;
    tagTone: string;
    date: string;
    image: string;
    heroImage: string;
    byline: string;
    publishedOn: string;
    readTime: string;
    body: JsonValue;
    partners: string;
    location: string;
    timeline: string;
    status: string;
    statusTone: string;
    technologies: string;
    paperJournal: string | null;
    paperUrl: string | null;
    leadResearcher: string | null;
    videoUrl: string | null;
    milestones: JsonValue;
    publicationEntries: JsonValue;
    published: boolean;
    completion: number;
    publications: number;
    teamSize: number;
    partnerCount: number;
    updatedAt: Date;
  } | null;
}) {
  const [state, formAction] = useFormState(saveProject, { error: null });
  const [summary, setSummary] = useState(project?.description ?? "");

  const [published, setPublished] = useState(project?.published ?? true);

  const initialMilestones = Array.isArray(project?.milestones)
    ? (project.milestones as { title: string; date: string; status: string }[]).filter(
        (m) => m && typeof m.title === "string",
      )
    : [];
  const [milestones, setMilestones] = useState(initialMilestones);
  const initialPublications = Array.isArray(project?.publicationEntries)
    ? (project.publicationEntries as { title: string; journal: string; status: string }[]).filter(
        (entry) => entry && typeof entry.title === "string",
      )
    : [];
  const [publications, setPublications] = useState(initialPublications);
  // Pending row removal — confirmed through the shared dialog.
  const [removeTarget, setRemoveTarget] = useState<{
    kind: "milestone" | "publication";
    index: number;
  } | null>(null);


  return (
    <form action={formAction} className="flex flex-col gap-6 p-6">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="published" value={String(published)} />
      <input type="hidden" name="milestonesJson" value={JSON.stringify(milestones)} />
      <input type="hidden" name="publicationEntriesJson" value={JSON.stringify(publications)} />
      {/* Required by the save schema — kept as the project's current tone. */}
      <ConfirmDialog
        open={removeTarget !== null}
        title={
          removeTarget?.kind === "publication"
            ? "Remove this publication?"
            : "Remove this milestone?"
        }
        description={
          removeTarget
            ? (removeTarget.kind === "publication"
                ? publications[removeTarget.index]?.title
                : milestones[removeTarget.index]?.title) || "Unsaved entry"
            : undefined
        }
        confirmLabel="Remove"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget) return;
          if (removeTarget.kind === "publication") {
            setPublications((prev) => prev.filter((_, j) => j !== removeTarget.index));
          } else {
            setMilestones((prev) => prev.filter((_, j) => j !== removeTarget.index));
          }
          setRemoveTarget(null);
        }}
      />

      <input type="hidden" name="tagTone" value={project?.tagTone ?? "sage"} />

      {/* ---------------------------------------------------- editor header */}
      <header className="flex flex-col gap-4">
        <Link
          href="/admin/projects"
          className="self-start text-sm font-semibold text-admin-azure hover:underline"
        >
          ← Back to Projects
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-[280px] flex-1 flex-col gap-1">
            <input
              name="title"
              required
              defaultValue={project?.title}
              placeholder="Project title"
              aria-label="Project title"
              className="border-0 bg-transparent text-2xl font-bold text-ink outline-none placeholder:text-gray-300"
            />
            <p className="text-xs text-gray-400">
              {project
                ? `Last saved: ${project.updatedAt.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "New project — not saved yet"}
            </p>
          </div>
          <PublishButtons />
        </div>
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {state.error}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* ---------------------------------------------------- left column */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Project Overview</h2>

            <ImageUploadField
              name="heroImage"
              label="Project Hero Cover Image"
              required
              defaultValue={project?.heroImage}
              hint="Recommended size: 1200×630px. Max 4MB."
              previewClassName="h-[150px] sm:w-[240px]"
              className="mb-4"
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="summary" className={labelClass}>
                Short Project Summary (Public Deck)
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={3}
                maxLength={240}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-admin-azure"
              />
              <p className="text-right text-xs text-gray-400">
                {summary.length} / 240 characters
              </p>
              <input
                type="hidden"
                name="description"
                value={summary || "Untitled project"}
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink">Project Content</h2>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-admin-azure">
                <span className="size-1.5 rounded-full bg-admin-azure" />
                Editor Synced
              </span>
            </div>
            <RichEditor content={project?.body} name="body" />
          </section>
        </div>

        {/* --------------------------------------------------- settings column */}
        <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-[360px]">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Project Settings</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Status</span>
                <select name="statusTone" defaultValue={project?.statusTone ?? "sage"} className={inputClass}>
                  <option value="sage">Active Project</option>
                  <option value="clay">Evaluation Phase</option>
                </select>
              </label>
              <input type="hidden" name="status" value={project?.status ?? "Clinical Pilot"} />
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Slug (public URL)</span>
                <input
                  name="slug"
                  required
                  defaultValue={project?.slug}
                  placeholder="ai-in-laparoscopy"
                  className={inputClass}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="size-4 rounded accent-admin-azure"
                />
                <span className="text-sm text-[#1e293b]">Show on public site</span>
              </label>
              <p className="-mt-2 text-xs text-gray-400">
                Determine search visibility
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Details</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["tag", "Tag"],
                ["date", "Display date"],
                ["byline", "Byline"],
                ["publishedOn", "Published on"],
                ["readTime", "Read time"],
                ["partners", "Partners"],
                ["location", "Location"],
                ["timeline", "Timeline"],
                ["technologies", "Technologies"],
                ["paperJournal", "Paper journal"],
                ["paperUrl", "Paper URL"],
              ].map(([name, label]) => (
                <label key={name} className="flex flex-col gap-1.5">
                  <span className={labelClass}>{label}</span>
                  <input
                    name={name}
                    defaultValue={
                      project ? String((project as Record<string, unknown>)[name] ?? "") : ""
                    }
                    className={inputClass}
                  />
                </label>
              ))}
              <ImageUploadField
                name="image"
                label="Card image"
                defaultValue={project?.image}
                previewClassName="h-28"
                className="col-span-2"
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Team &amp; Ownership</h2>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Lead Researcher</span>
              <input
                name="leadResearcher"
                defaultValue={project?.leadResearcher ?? ""}
                placeholder="Dr. Amara Osei"
                className={inputClass}
              />
            </label>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink">Research Milestones</h2>
              <button
                type="button"
                onClick={() =>
                  setMilestones((prev) => [
                    ...prev,
                    { title: "", date: "", status: "inProgress" },
                  ])
                }
                className="flex items-center gap-1 text-xs font-semibold text-admin-azure hover:underline"
              >
                <Plus className="size-3.5" />
                Add Milestone
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {milestones.map((m, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        m.status === "completed" && "bg-[#e2f4fd] text-admin-azure",
                        m.status === "inProgress" && "bg-[#cbe9fa] text-admin-azure",
                        m.status === "planned" && "bg-[#e7ecf1] text-admin-navy",
                      )}
                    >
                      {m.status === "completed"
                        ? "Completed"
                        : m.status === "inProgress"
                          ? "In Progress"
                          : "Planned"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRemoveTarget({ kind: "milestone", index: i })}
                      aria-label="Remove milestone"
                      className="text-gray-300 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <input
                      value={m.title}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                        )
                      }
                      placeholder="Milestone title"
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <input
                        value={m.date}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)),
                          )
                        }
                        placeholder="e.g. Completed June 2024"
                        className={inputClass}
                      />
                      <select
                        value={m.status}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)),
                          )
                        }
                        aria-label="Milestone status"
                        className="h-10 w-32 shrink-0 rounded-lg border border-gray-200 bg-white px-2 text-sm text-ink outline-none focus:border-admin-azure"
                      >
                        <option value="completed">Completed</option>
                        <option value="inProgress">In Progress</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {milestones.length === 0 && (
                <p className="text-xs text-gray-400">No milestones yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink">Publications</h2>
              <button
                type="button"
                onClick={() =>
                  setPublications((prev) => [
                    ...prev,
                    { title: "", journal: "", status: "Published" },
                  ])
                }
                className="flex items-center gap-1 text-xs font-semibold text-admin-azure hover:underline"
              >
                <Plus className="size-3.5" />
                Add Publication
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {publications.map((entry, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <input
                      value={entry.journal}
                      onChange={(e) =>
                        setPublications((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, journal: e.target.value } : x)),
                        )
                      }
                      placeholder="Journal"
                      className="h-9 w-40 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-ink outline-none focus:border-admin-azure"
                    />
                    <button
                      type="button"
                      onClick={() => setRemoveTarget({ kind: "publication", index: i })}
                      aria-label="Remove publication"
                      className="text-gray-300 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <input
                      value={entry.title}
                      onChange={(e) =>
                        setPublications((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                        )
                      }
                      placeholder="Publication title"
                      className={inputClass}
                    />
                    <select
                      value={entry.status}
                      onChange={(e) =>
                        setPublications((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)),
                        )
                      }
                      aria-label="Publication status"
                      className="h-10 w-40 rounded-lg border border-gray-200 bg-white px-2 text-sm text-ink outline-none focus:border-admin-azure"
                    >
                      <option>Published</option>
                      <option>Under Review</option>
                      <option>Preprint</option>
                    </select>
                  </div>
                </div>
              ))}
              {publications.length === 0 && (
                <p className="text-xs text-gray-400">No publications listed.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Completion &amp; Progress</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Overall Completion</span>
                <input
                  type="number"
                  name="completion"
                  min={0}
                  max={100}
                  defaultValue={project?.completion ?? 0}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Publications</span>
                <input
                  type="number"
                  name="publications"
                  min={0}
                  defaultValue={project?.publications ?? 0}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Team Members</span>
                <input
                  type="number"
                  name="teamSize"
                  min={0}
                  defaultValue={project?.teamSize ?? 0}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Partners</span>
                <input
                  type="number"
                  name="partnerCount"
                  min={0}
                  defaultValue={project?.partnerCount ?? 0}
                  className={inputClass}
                />
              </label>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
