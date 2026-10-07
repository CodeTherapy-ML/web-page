"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendLeadReply } from "@/lib/email";

/**
 * Messages screen — status, replies, notes and deletion for Lead rows
 * (contact form and newsletter signups). The `new` count also drives the
 * topbar bell badge, so every mutation revalidates the whole portal shell.
 *
 * Status lifecycle: new → reviewed (opened) → replied (in-app reply sent)
 * → archived. Archived rows stay searchable and exportable.
 */

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/messages");
}

const statusInput = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "reviewed", "archived"]),
});

export async function setLeadStatus(
  input: z.infer<typeof statusInput>,
): Promise<{ error: string | null }> {
  await requireAdmin();
  const parsed = statusInput.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };

  await db.lead.updateMany({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  refresh();
  return { error: null };
}

export async function markAllReviewed(): Promise<{ updated: number }> {
  await requireAdmin();
  const { count } = await db.lead.updateMany({
    where: { status: "new" },
    data: { status: "reviewed" },
  });
  refresh();
  return { updated: count };
}

const replyInput = z.object({
  id: z.string().min(1),
  subject: z.string().min(1, "A subject is required"),
  body: z.string().min(1, "The reply cannot be empty"),
});

/**
 * Sends the composed reply to the lead's address, then stamps the Lead:
 * status → replied, repliedAt → now, and the reply appended to replyLog.
 */
export async function replyToLead(
  input: z.infer<typeof replyInput>,
): Promise<{ error: string | null }> {
  await requireAdmin();
  const parsed = replyInput.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lead = await db.lead.findUnique({ where: { id: parsed.data.id } });
  if (!lead) return { error: "That message no longer exists — refresh the page." };

  const sent = await sendLeadReply({
    to: lead.email,
    name: lead.name,
    subject: parsed.data.subject,
    body: parsed.data.body,
  });
  if (!sent) {
    return {
      error:
        "SMTP is not configured — the reply was not sent. Set SMTP_* in .env and try again.",
    };
  }

  const entry = {
    at: new Date().toISOString(),
    subject: parsed.data.subject,
    body: parsed.data.body,
  };
  await db.lead.update({
    where: { id: lead.id },
    data: {
      status: "replied",
      repliedAt: new Date(),
      replyLog: [
        ...((lead.replyLog as { at: string; subject: string; body: string }[]) ?? []),
        entry,
      ],
    },
  });
  refresh();
  return { error: null };
}

const notesInput = z.object({
  id: z.string().min(1),
  notes: z.string().max(2000),
});

/** Internal notes — the team's scratchpad on an enquiry. */
export async function saveLeadNotes(
  input: z.infer<typeof notesInput>,
): Promise<{ error: string | null }> {
  await requireAdmin();
  const parsed = notesInput.safeParse(input);
  if (!parsed.success) return { error: "Invalid request." };

  await db.lead.updateMany({
    where: { id: parsed.data.id },
    data: { notes: parsed.data.notes.trim() || null },
  });
  refresh();
  return { error: null };
}

const bulkInput = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["reviewed", "archived"]),
});

export async function bulkSetLeadStatus(
  input: z.infer<typeof bulkInput>,
): Promise<{ error: string | null; updated: number }> {
  await requireAdmin();
  const parsed = bulkInput.safeParse(input);
  if (!parsed.success) return { error: "Invalid request.", updated: 0 };

  const { count } = await db.lead.updateMany({
    where: { id: { in: parsed.data.ids } },
    data: { status: parsed.data.status },
  });
  refresh();
  return { error: null, updated: count };
}

export async function bulkDeleteLeads(input: {
  ids: string[];
}): Promise<{ error: string | null; deleted: number }> {
  await requireAdmin();
  const parsed = z.array(z.string()).min(1).safeParse(input.ids);
  if (!parsed.success) return { error: "Invalid request.", deleted: 0 };

  const { count } = await db.lead.deleteMany({
    where: { id: { in: parsed.data } },
  });
  refresh();
  return { error: null, deleted: count };
}

export async function deleteLead(id: string): Promise<{ error: string | null }> {
  await requireAdmin();
  if (!id) return { error: "Invalid request." };
  await db.lead.deleteMany({ where: { id } });
  refresh();
  return { error: null };
}
