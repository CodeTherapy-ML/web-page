"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendContactEmails, sendNewsletterEmails } from "@/lib/email";

/**
 * Contact + newsletter lead capture — validates, persists to the Lead table
 * (which feeds /admin/messages and the topbar bell) and sends two emails:
 * a notification to the team inbox and a confirmation to the submitter.
 */

const contactInput = z.object({
  name: z.string().min(1, "Enter your full name.").max(120),
  email: z.string().email("Enter a valid email address."),
  organization: z.string().max(160).optional().default(""),
  inquiry: z.string().min(1),
  message: z.string().min(10, "Tell us a little more (at least 10 characters).").max(5000),
});

export type ContactResult =
  | { ok: true; emailed: boolean }
  | { ok: false; error: string };

export async function submitContact(
  _prev: ContactResult,
  formData: FormData,
): Promise<ContactResult> {
  const parsed = contactInput.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  await db.lead.create({
    data: {
      source: "contact",
      inquiryType: d.inquiry,
      name: d.name,
      email: d.email,
      organization: d.organization || null,
      message: d.message,
    },
  });

  const delivery = await sendContactEmails({
    name: d.name,
    email: d.email,
    organization: d.organization || null,
    inquiry: d.inquiry,
    message: d.message,
  });

  // The new row drives the Messages screen and the topbar badge.
  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return { ok: true, emailed: delivery.sender };
}

export async function submitNewsletter(
  _prev: ContactResult,
  formData: FormData,
): Promise<ContactResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email("Enter a valid email address.").safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await db.lead.create({
    data: {
      source: "newsletter",
      name: email.split("@")[0],
      email,
      message: "Newsletter subscription",
    },
  });

  const delivery = await sendNewsletterEmails(email);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return { ok: true, emailed: delivery.sender };
}
