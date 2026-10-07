import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  INBOX_MAX_ROWS,
  parseInboxParams,
  type InboxLead,
  type InboxSearchParams,
  type ParsedInboxParams,
} from "@/lib/messages-params";

export {
  INBOX_MAX_ROWS,
  INBOX_PAGE_SIZE,
  LEAD_STATUSES,
  inboxHref,
  inboxQueryString,
  parseInboxParams,
} from "@/lib/messages-params";
export type {
  InboxLead,
  InboxSearchParams,
  LeadStatus,
  ParsedInboxParams,
} from "@/lib/messages-params";

/**
 * Messages inbox query — server-side search/filter/pagination over Lead rows.
 * The inbox UI keeps its state in the URL (?q=&source=&status=&limit=), so
 * every change re-renders through the server and search always scans the
 * whole table (the old client build only searched the first 500 rows).
 *
 * The default view (no status param) hides archived rows so the inbox stays
 * current; pick the Archived filter to bring them back.
 */

export function inboxWhere(params: ParsedInboxParams): Prisma.LeadWhereInput {
  const { q, source, status } = params;
  return {
    ...(source ? { source } : {}),
    ...(status ? { status } : { status: { not: "archived" } }),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { organization: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function getInbox(searchParams: InboxSearchParams, openId?: string) {
  const parsed = parseInboxParams(searchParams);
  const where = inboxWhere(parsed);

  const [rows, filtered, all, newCount, archivedCount, contactCount, newsletterCount] =
    await Promise.all([
      db.lead.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: parsed.limit,
      }),
      db.lead.count({ where }),
      db.lead.count(),
      db.lead.count({ where: { status: "new" } }),
      db.lead.count({ where: { status: "archived" } }),
      db.lead.count({ where: { source: "contact" } }),
      db.lead.count({ where: { source: "newsletter" } }),
    ]);

  let leads: InboxLead[] = rows.map(serializeLead);

  // A deep-linked message may be older than the current page — fetch it and
  // put it on top so the detail panel always has its row.
  if (openId && !leads.some((lead) => lead.id === openId)) {
    const extra = await db.lead.findUnique({ where: { id: openId } });
    if (extra) leads = [serializeLead(extra), ...leads];
  }

  return {
    leads,
    hasMore: rows.length < filtered && parsed.limit < INBOX_MAX_ROWS,
    counts: {
      all,
      filtered,
      unread: newCount,
      archived: archivedCount,
      contact: contactCount,
      newsletter: newsletterCount,
    },
    params: parsed,
  };
}

function serializeLead(lead: {
  id: string;
  source: string;
  inquiryType: string | null;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  status: string;
  notes: string | null;
  repliedAt: Date | null;
  replyLog: unknown;
  createdAt: Date;
}): InboxLead {
  return {
    id: lead.id,
    source: lead.source,
    inquiryType: lead.inquiryType,
    name: lead.name,
    email: lead.email,
    organization: lead.organization,
    message: lead.message,
    status: lead.status,
    notes: lead.notes,
    repliedAt: lead.repliedAt?.toISOString() ?? null,
    replyLog: Array.isArray(lead.replyLog)
      ? (lead.replyLog as InboxLead["replyLog"])
      : [],
    createdAt: lead.createdAt.toISOString(),
  };
}
