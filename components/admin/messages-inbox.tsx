"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Building2,
  CheckCheck,
  Download,
  Inbox,
  Mail,
  MailOpen,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import {
  bulkDeleteLeads,
  bulkSetLeadStatus,
  deleteLead,
  markAllReviewed,
  replyToLead,
  saveLeadNotes,
  setLeadStatus,
} from "@/app/admin/(portal)/messages/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  INBOX_MAX_ROWS,
  INBOX_PAGE_SIZE,
  inboxHref,
  inboxQueryString,
  type InboxLead,
  type ParsedInboxParams,
} from "@/lib/messages-params";
import { cn } from "@/lib/utils";

type Counts = {
  all: number;
  filtered: number;
  unread: number;
  archived: number;
  contact: number;
  newsletter: number;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function defaultSubject(lead: InboxLead): string {
  return lead.source === "newsletter"
    ? "CodeTherapy research digest"
    : `Re: your enquiry to CodeTherapy${lead.inquiryType ? ` — ${lead.inquiryType}` : ""}`;
}

function defaultBody(lead: InboxLead): string {
  return `Hi ${lead.name.split(" ")[0]},\n\n\n\n— CodeTherapy`;
}

function statusLabel(status: string): string {
  if (status === "new") return "Unread";
  if (status === "replied") return "Replied";
  if (status === "archived") return "Archived";
  return "Reviewed";
}

export default function MessagesInbox({
  leads,
  counts,
  hasMore,
  initialParams,
  openId,
}: {
  leads: InboxLead[];
  counts: Counts;
  hasMore: boolean;
  initialParams: ParsedInboxParams;
  openId: string | null;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialParams.q);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<
    null | { kind: "one" } | { kind: "bulk" }
  >(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const autoMarked = useRef<string | null>(null);

  const selected = leads.find((lead) => lead.id === openId) ?? null;

  useEffect(() => {
    setQuery(initialParams.q);
  }, [initialParams.q]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (query.trim() === initialParams.q) return;
      router.replace(
        inboxHref(openId, {
          ...initialParams,
          q: query.trim(),
          limit: INBOX_PAGE_SIZE,
        }),
      );
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, initialParams, openId, router]);

  useEffect(() => {
    if (!selected) {
      setComposing(false);
      setNotes("");
      return;
    }
    setComposing(false);
    setReplyError(null);
    setSubject(defaultSubject(selected));
    setBody(defaultBody(selected));
    setNotes(selected.notes ?? "");
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || selected.status !== "new") return;
    if (autoMarked.current === selected.id) return;
    autoMarked.current = selected.id;
    startTransition(async () => {
      const res = await setLeadStatus({ id: selected.id, status: "reviewed" });
      if (res.error) {
        autoMarked.current = null;
        return;
      }
      router.refresh();
    });
  }, [selected, router]);

  function navigate(id: string | null, next?: Partial<ParsedInboxParams>) {
    router.push(
      inboxHref(id, {
        ...initialParams,
        ...next,
      }),
    );
  }

  function toggleChecked(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allChecked = leads.length > 0 && checked.size === leads.length;

  function run(action: () => Promise<void>) {
    startTransition(action);
  }

  async function sendReply() {
    if (!selected) return;
    setReplyError(null);
    const res = await replyToLead({
      id: selected.id,
      subject: subject.trim(),
      body: body.trim(),
    });
    if (res.error) {
      setReplyError(res.error);
      return;
    }
    setComposing(false);
    toast({ title: "Reply sent" });
    router.refresh();
  }

  async function persistNotes() {
    if (!selected) return;
    const res = await saveLeadNotes({ id: selected.id, notes });
    if (res.error) {
      toast({ title: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Notes saved" });
    router.refresh();
  }

  const csvHref = `/admin/api/leads-csv${
    inboxQueryString(initialParams) ? `?${inboxQueryString(initialParams)}` : ""
  }`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Messages</h1>
          <p className="text-sm text-gray-500">
            Every contact-form enquiry and newsletter signup from the public site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={csvHref}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-admin-azure hover:text-admin-azure"
          >
            <Download className="size-4" />
            Export CSV
          </a>
          {counts.unread > 0 && (
            <button
              type="button"
              onClick={() =>
                run(async () => {
                  const { updated } = await markAllReviewed();
                  toast({
                    title: updated
                      ? `${updated} message${updated === 1 ? "" : "s"} marked reviewed`
                      : "Nothing left to review",
                  });
                  router.refresh();
                })
              }
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
            >
              <CheckCheck className="size-4" />
              Mark all reviewed
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Messages", value: counts.all },
          { label: "Unread", value: counts.unread },
          { label: "Contact Enquiries", value: counts.contact },
          { label: "Newsletter Signups", value: counts.newsletter },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-[13px] font-medium text-gray-500">{kpi.label}</p>
            <p className="text-[28px] font-bold text-ink">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterGroup
          value={initialParams.source ?? "all"}
          onChange={(value) =>
            navigate(openId, {
              source: value === "all" ? null : (value as "contact" | "newsletter"),
              limit: INBOX_PAGE_SIZE,
            })
          }
          options={[
            { value: "all", label: "All sources" },
            { value: "contact", label: "Contact" },
            { value: "newsletter", label: "Newsletter" },
          ]}
        />
        <FilterGroup
          value={initialParams.status ?? "all"}
          onChange={(value) =>
            navigate(openId, {
              status:
                value === "all"
                  ? null
                  : (value as ParsedInboxParams["status"]),
              limit: INBOX_PAGE_SIZE,
            })
          }
          options={[
            { value: "all", label: "Inbox" },
            { value: "new", label: `Unread${counts.unread ? ` (${counts.unread})` : ""}` },
            { value: "reviewed", label: "Reviewed" },
            { value: "replied", label: "Replied" },
            {
              value: "archived",
              label: `Archived${counts.archived ? ` (${counts.archived})` : ""}`,
            },
          ]}
        />
        <label className="ml-auto flex h-9 w-[240px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
          <Search className="size-4 shrink-0 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, message…"
            aria-label="Search messages"
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-gray-400"
          />
        </label>
      </div>

      {checked.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-admin-azure/30 bg-[#e2f4fd] px-4 py-2.5">
          <p className="text-sm font-semibold text-admin-azure">
            {checked.size} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const res = await bulkSetLeadStatus({
                    ids: Array.from(checked),
                    status: "reviewed",
                  });
                  if (res.error) {
                    toast({ title: res.error, variant: "destructive" });
                    return;
                  }
                  setChecked(new Set());
                  toast({ title: `${res.updated} marked reviewed` });
                  router.refresh();
                })
              }
              className="rounded-lg border border-admin-azure px-3 py-1.5 text-xs font-semibold text-admin-azure transition-colors hover:bg-admin-azure hover:text-white disabled:opacity-60"
            >
              Mark reviewed
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const res = await bulkSetLeadStatus({
                    ids: Array.from(checked),
                    status: "archived",
                  });
                  if (res.error) {
                    toast({ title: res.error, variant: "destructive" });
                    return;
                  }
                  setChecked(new Set());
                  toast({ title: `${res.updated} archived` });
                  router.refresh();
                })
              }
              className="rounded-lg border border-admin-azure px-3 py-1.5 text-xs font-semibold text-admin-azure transition-colors hover:bg-admin-azure hover:text-white disabled:opacity-60"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => setConfirm({ kind: "bulk" })}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white">
          {leads.length > 0 && (
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() =>
                  setChecked(
                    allChecked ? new Set() : new Set(leads.map((lead) => lead.id)),
                  )
                }
                aria-label="Select all visible messages"
                className="size-4 accent-admin-azure"
              />
              <p className="text-[12px] text-gray-400">
                Showing {leads.length} of {counts.filtered}
                {counts.archived > 0 && initialParams.status !== "archived"
                  ? ` · ${counts.archived} archived hidden`
                  : ""}
              </p>
            </div>
          )}

          {leads.map((lead) => (
            <div
              key={lead.id}
              className={cn(
                "flex items-start gap-3 border-b border-gray-100 px-4 py-3 last:border-0",
                selected?.id === lead.id && "bg-azure-soft/60",
              )}
            >
              <input
                type="checkbox"
                checked={checked.has(lead.id)}
                onChange={() => toggleChecked(lead.id)}
                aria-label={`Select ${lead.name}`}
                className="mt-1 size-4 shrink-0 accent-admin-azure"
              />
              <Link
                href={inboxHref(lead.id, initialParams)}
                scroll={false}
                className="flex min-w-0 flex-1 items-start gap-3 text-left hover:opacity-90"
              >
                <span className="mt-0.5 shrink-0 text-gray-400">
                  {lead.status === "new" ? (
                    <Mail className="size-4 text-admin-azure" />
                  ) : lead.status === "replied" ? (
                    <Reply className="size-4 text-admin-azure" />
                  ) : lead.status === "archived" ? (
                    <Archive className="size-4" />
                  ) : (
                    <MailOpen className="size-4" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-sm text-ink",
                        lead.status === "new" ? "font-bold" : "font-medium",
                      )}
                    >
                      {lead.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        lead.source === "contact"
                          ? "bg-azure-soft text-admin-azure"
                          : "bg-navy-soft text-admin-navy",
                      )}
                    >
                      {lead.source}
                    </span>
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {lead.inquiryType ? `${lead.inquiryType} · ` : ""}
                    {lead.message}
                  </span>
                </span>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-gray-400">
                  {formatDate(lead.createdAt)}
                </span>
              </Link>
            </div>
          ))}

          {leads.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <Inbox className="size-6 text-gray-300" />
              <p className="text-sm text-gray-500">
                {counts.all === 0
                  ? "No messages yet — submissions from the contact form land here."
                  : "No messages match these filters."}
              </p>
            </div>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() =>
                navigate(openId, {
                  limit: Math.min(
                    initialParams.limit + INBOX_PAGE_SIZE,
                    INBOX_MAX_ROWS,
                  ),
                })
              }
              className="border-t border-gray-100 px-4 py-3 text-sm font-semibold text-admin-azure hover:bg-gray-50"
            >
              Load more
            </button>
          )}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 xl:w-[400px]">
          {selected ? (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-ink">{selected.name}</h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-[13px] text-admin-azure hover:underline"
                >
                  {selected.email}
                </a>
              </div>

              <dl className="flex flex-col gap-3 border-y border-gray-100 py-4 text-[13px]">
                {selected.organization && (
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 shrink-0 text-gray-400" />
                    <dt className="sr-only">Organization</dt>
                    <dd className="text-gray-600">{selected.organization}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-gray-400">
                    Inquiry type
                  </dt>
                  <dd className="text-gray-600">{selected.inquiryType ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-gray-400">
                    Received
                  </dt>
                  <dd className="text-gray-600">{formatDate(selected.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-gray-400">
                    Status
                  </dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      selected.status === "new"
                        ? "text-admin-azure"
                        : selected.status === "replied"
                          ? "text-admin-azure"
                          : "text-gray-500",
                    )}
                  >
                    {statusLabel(selected.status)}
                    {selected.repliedAt
                      ? ` · ${formatDate(selected.repliedAt)}`
                      : ""}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                  Message
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-[13px] leading-relaxed text-ink">
                  {selected.message}
                </p>
              </div>

              {selected.replyLog.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                    Sent replies
                  </p>
                  <ul className="flex flex-col gap-2">
                    {selected.replyLog.map((entry) => (
                      <li
                        key={entry.at}
                        className="rounded-lg border border-gray-100 p-3 text-[13px]"
                      >
                        <p className="font-semibold text-ink">{entry.subject}</p>
                        <p className="mb-1 text-[11px] text-gray-400">
                          {formatDate(entry.at)}
                        </p>
                        <p className="whitespace-pre-wrap text-gray-600">{entry.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {composing ? (
                <form
                  className="flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(sendReply);
                  }}
                >
                  <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-gray-400">
                    Subject
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="h-9 rounded-lg border border-gray-200 px-3 text-[13px] font-normal normal-case text-ink outline-none focus:border-admin-azure"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-gray-400">
                    Reply
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                      rows={7}
                      className="rounded-lg border border-gray-200 p-3 text-[13px] font-normal normal-case leading-relaxed text-ink outline-none focus:border-admin-azure"
                    />
                  </label>
                  {replyError && (
                    <p className="text-[13px] text-red-600">{replyError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="flex h-[38px] flex-1 items-center justify-center gap-2 rounded-lg bg-admin-azure text-[13px] font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
                    >
                      Send reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposing(false)}
                      className="h-[38px] rounded-lg border border-gray-200 px-3 text-[13px] font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setComposing(true)}
                    className="flex h-[38px] items-center justify-center gap-2 rounded-lg bg-admin-azure text-[13px] font-semibold text-white transition-colors hover:bg-azure-deep"
                  >
                    <Reply className="size-3.5" />
                    Reply
                  </button>
                  {selected.status === "archived" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(async () => {
                          await setLeadStatus({
                            id: selected.id,
                            status: "reviewed",
                          });
                          toast({ title: "Moved back to inbox" });
                          router.refresh();
                        })
                      }
                      className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-600 hover:border-admin-azure hover:text-admin-azure disabled:opacity-60"
                    >
                      Restore to inbox
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(async () => {
                            const next =
                              selected.status === "new" ? "reviewed" : "new";
                            autoMarked.current =
                              next === "new" ? selected.id : autoMarked.current;
                            await setLeadStatus({
                              id: selected.id,
                              status: next,
                            });
                            router.refresh();
                          })
                        }
                        className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-600 hover:border-admin-azure hover:text-admin-azure disabled:opacity-60"
                      >
                        {selected.status === "new" ? (
                          <>
                            <MailOpen className="size-3.5" />
                            Mark reviewed
                          </>
                        ) : (
                          <>
                            <Mail className="size-3.5" />
                            Mark unread
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(async () => {
                            await setLeadStatus({
                              id: selected.id,
                              status: "archived",
                            });
                            toast({ title: "Archived" });
                            router.refresh();
                          })
                        }
                        className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-600 hover:border-admin-azure hover:text-admin-azure disabled:opacity-60"
                      >
                        <Archive className="size-3.5" />
                        Archive
                      </button>
                    </>
                  )}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-wide text-gray-400">
                  Internal notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Scratchpad for the team — not sent to the contact."
                  className="rounded-lg border border-gray-200 p-3 text-[13px] leading-relaxed text-ink outline-none placeholder:text-gray-400 focus:border-admin-azure"
                />
                <button
                  type="button"
                  disabled={pending || notes === (selected.notes ?? "")}
                  onClick={() => run(persistNotes)}
                  className="self-end text-[12px] font-semibold text-admin-azure disabled:text-gray-300"
                >
                  Save notes
                </button>
              </label>

              <button
                type="button"
                onClick={() => setConfirm({ kind: "one" })}
                disabled={pending}
                className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-red-600 bg-[#fee2e2] text-[13px] font-semibold text-red-600 transition-colors hover:bg-[#fecaca] disabled:opacity-60"
              >
                <Trash2 className="size-3.5" />
                Delete message
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Select a message to read it in full. Opening a message marks it
              reviewed and gives it a shareable URL.
            </p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.kind === "bulk"
            ? `Delete ${checked.size} message${checked.size === 1 ? "" : "s"}?`
            : "Delete this message?"
        }
        description={
          confirm?.kind === "bulk"
            ? "Selected messages are removed permanently. This cannot be undone."
            : selected
              ? `From ${selected.name}${selected.organization ? ` — ${selected.organization}` : ""}. This cannot be undone.`
              : undefined
        }
        pending={confirmPending}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          setConfirmPending(true);
          try {
            if (confirm?.kind === "bulk") {
              const res = await bulkDeleteLeads({ ids: Array.from(checked) });
              if (res.error) {
                toast({ title: res.error, variant: "destructive" });
                return;
              }
              setChecked(new Set());
              toast({ title: `${res.deleted} deleted` });
              if (openId && checked.has(openId)) navigate(null);
            } else if (selected) {
              const res = await deleteLead(selected.id);
              if (res.error) {
                toast({ title: res.error, variant: "destructive" });
                return;
              }
              toast({ title: "Message deleted" });
              navigate(null);
            }
            router.refresh();
          } finally {
            setConfirmPending(false);
            setConfirm(null);
          }
        }}
      />
    </div>
  );
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            value === option.value
              ? "bg-admin-azure text-white"
              : "text-gray-600 hover:bg-gray-50",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
