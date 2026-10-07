/**
 * URL + filter helpers for the admin inbox. Kept free of Prisma/db so the
 * client list can import `inboxHref` without pulling the server client.
 */

export const INBOX_PAGE_SIZE = 20;
export const INBOX_MAX_ROWS = 500;

export const LEAD_STATUSES = ["new", "reviewed", "replied", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type InboxSearchParams = {
  q?: string;
  source?: string;
  status?: string;
  limit?: string;
};

export type InboxLead = {
  id: string;
  source: string;
  inquiryType: string | null;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  status: string;
  notes: string | null;
  repliedAt: string | null;
  replyLog: { at: string; subject: string; body: string }[];
  createdAt: string;
};

export type ParsedInboxParams = {
  q: string;
  source: "contact" | "newsletter" | null;
  status: LeadStatus | null;
  limit: number;
};

export function parseInboxParams(searchParams: InboxSearchParams): ParsedInboxParams {
  const q = (searchParams.q ?? "").trim().slice(0, 120);
  const source =
    searchParams.source === "contact" || searchParams.source === "newsletter"
      ? searchParams.source
      : null;
  const status = (LEAD_STATUSES as readonly string[]).includes(searchParams.status ?? "")
    ? (searchParams.status as LeadStatus)
    : null;
  const requested = parseInt(searchParams.limit ?? "", 10);
  const limit = Math.min(
    Math.max(Number.isFinite(requested) ? requested : INBOX_PAGE_SIZE, INBOX_PAGE_SIZE),
    INBOX_MAX_ROWS,
  );
  return { q, source, status, limit };
}

/** Querystring that matches the current filter (used by Export CSV). */
export function inboxQueryString(params: ParsedInboxParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.source) sp.set("source", params.source);
  if (params.status) sp.set("status", params.status);
  return sp.toString();
}

/**
 * Selection is the path (`/admin/messages/[id]`); filters live on the
 * query string. `limit` is omitted at the default page size so URLs stay short.
 */
export function inboxHref(id: string | null, params: ParsedInboxParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.source) sp.set("source", params.source);
  if (params.status) sp.set("status", params.status);
  if (params.limit !== INBOX_PAGE_SIZE) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  const base = id ? `/admin/messages/${id}` : "/admin/messages";
  return qs ? `${base}?${qs}` : base;
}
