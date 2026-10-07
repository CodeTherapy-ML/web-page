import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import {
  contactAcknowledgement,
  contactNotification,
  leadReply,
  newsletterNotification,
  newsletterWelcome,
  type ContactSubmission,
  type Mail,
} from "@/lib/email-templates";

/**
 * SMTP mail service (replaces EmailJS). Transient transport, created per send
 * from env config. When SMTP_* is missing, sends degrade to a console notice —
 * leads are still persisted, they just don't trigger an email.
 *
 * Every public form sends two messages: one to the team inbox and one back to
 * the person who submitted it. Templates live in lib/email-templates.ts.
 */

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transport;
}

const FROM = process.env.SMTP_FROM || "CodeTherapy <no-reply@codetherapy.ml>";

async function send(options: {
  to: string;
  replyTo?: string;
  mail: Mail;
}): Promise<boolean> {
  const mailer = getTransport();
  if (!mailer) {
    console.warn(
      `[email] SMTP not configured — skipping "${options.mail.subject}" to ${options.to}. Set SMTP_* in .env.`,
    );
    return false;
  }
  try {
    await mailer.sendMail({
      from: FROM,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.mail.subject,
      text: options.mail.text,
      html: options.mail.html,
    });
    return true;
  } catch (e) {
    console.error(`[email] failed to send "${options.mail.subject}":`, e);
    return false;
  }
}

/**
 * Team inbox + whether form notifications are switched on.
 * Settings → General owns both (`contactEmail`, `notifications`); SMTP_USER is
 * the fallback recipient so a fresh install still reaches someone.
 */
async function inboxConfig(): Promise<{ to: string | null; notify: boolean }> {
  try {
    const [contact, notifications] = await Promise.all([
      db.setting.findUnique({ where: { key: "contactEmail" } }),
      db.setting.findUnique({ where: { key: "notifications" } }),
    ]);
    const configured = contact?.value;
    const flags = notifications?.value as { emailOnFormSubmission?: boolean } | null;
    return {
      to: (typeof configured === "string" && configured) || process.env.SMTP_USER || null,
      notify: flags?.emailOnFormSubmission ?? true,
    };
  } catch (e) {
    console.error("[email] could not read mail settings, using SMTP_USER:", e);
    return { to: process.env.SMTP_USER ?? null, notify: true };
  }
}

export type DeliveryResult = { admin: boolean; sender: boolean };

/** Contact form — notifies the team and acknowledges the sender. */
export async function sendContactEmails(
  submission: ContactSubmission,
): Promise<DeliveryResult> {
  const { to, notify } = await inboxConfig();

  const admin =
    notify && to
      ? await send({
          to,
          replyTo: submission.email,
          mail: contactNotification(submission),
        })
      : false;

  const sender = await send({
    to: submission.email,
    replyTo: to ?? undefined,
    mail: contactAcknowledgement(submission),
  });

  return { admin, sender };
}

/** Newsletter signup — notifies the team and welcomes the subscriber. */
export async function sendNewsletterEmails(email: string): Promise<DeliveryResult> {
  const { to, notify } = await inboxConfig();

  const admin =
    notify && to
      ? await send({ to, replyTo: email, mail: newsletterNotification(email) })
      : false;

  const sender = await send({
    to: email,
    replyTo: to ?? undefined,
    mail: newsletterWelcome(email),
  });

  return { admin, sender };
}

/**
 * A reply composed in the admin inbox. Sent straight to the lead's address
 * with the team inbox as reply-to, so follow-ups come back into Messages.
 * Returns false (without throwing) when SMTP is not configured.
 */
export async function sendLeadReply(input: {
  to: string;
  name: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  const { to: teamInbox } = await inboxConfig();
  return send({
    to: input.to,
    replyTo: teamInbox ?? undefined,
    mail: leadReply({ name: input.name, subject: input.subject, body: input.body }),
  });
}

export async function sendPasswordResetNote(email: string): Promise<boolean> {
  const mailer = getTransport();
  if (!mailer) return false;
  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      subject: "CodeTherapy admin — password reset request",
      text: [
        "A password reset was requested for your CodeTherapy admin account.",
        "If this was you, reply to this email and IT support will issue a reset link.",
        "If this wasn't you, you can safely ignore this message.",
      ].join("\n\n"),
    });
    return true;
  } catch (e) {
    console.error("[email] failed to send reset note:", e);
    return false;
  }
}
