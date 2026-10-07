/**
 * Transactional email templates (HTML + plain-text twin).
 *
 * Table-based layout with inline styles — the only thing that renders
 * consistently across Gmail/Outlook/Apple Mail. Brand tokens are duplicated
 * here as literals because email clients strip <style> and know nothing about
 * Tailwind: ink #0d1117, azure #00719d, cream #f4f8fb, line #dbe6ef.
 */

const INK = "#0d1117";
const INK_SOFT = "#45586a";
const AZURE = "#00719d";
const CREAM = "#f4f8fb";
const LINE = "#dbe6ef";

export type Mail = { subject: string; html: string; text: string };

type Row = { label: string; value: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(opts: {
  preheader: string;
  heading: string;
  intro: string;
  rows?: Row[];
  body?: string;
  footerNote?: string;
}): string {
  const rows = (opts.rows ?? [])
    .map(
      (row) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid ${LINE};font:600 12px/1.4 Helvetica,Arial,sans-serif;color:${INK_SOFT};text-transform:uppercase;letter-spacing:.04em;width:150px;vertical-align:top;">${escapeHtml(row.label)}</td>
              <td style="padding:8px 0;border-bottom:1px solid ${LINE};font:400 14px/1.5 Helvetica,Arial,sans-serif;color:${INK};">${escapeHtml(row.value)}</td>
            </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(opts.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CREAM};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${INK};padding:20px 28px;">
                <span style="font:700 18px/1 Helvetica,Arial,sans-serif;color:#ffffff;letter-spacing:-.01em;">Code<span style="color:#00aeef;">Therapy</span></span>
                <div style="font:400 12px/1.4 Helvetica,Arial,sans-serif;color:#8aa0b0;padding-top:6px;">Technology that reaches the last mile first.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font:700 20px/1.3 Georgia,serif;color:${INK};">${escapeHtml(opts.heading)}</h1>
                <p style="margin:0 0 20px;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:${INK_SOFT};">${escapeHtml(opts.intro)}</p>
                ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${rows}</table>` : ""}
                ${
                  opts.body
                    ? `<div style="background:${CREAM};border-left:3px solid ${AZURE};border-radius:0 8px 8px 0;padding:14px 16px;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:${INK};white-space:pre-wrap;">${escapeHtml(opts.body)}</div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${LINE};padding:16px 28px;font:400 12px/1.5 Helvetica,Arial,sans-serif;color:${INK_SOFT};">
                ${escapeHtml(opts.footerNote ?? "CodeTherapy — open-source medical AI for frontline health workers.")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function plain(heading: string, intro: string, rows: Row[], body?: string): string {
  return [
    heading,
    "",
    intro,
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    ...(body ? ["", body] : []),
    "",
    "—",
    "CodeTherapy — open-source medical AI for frontline health workers.",
  ].join("\n");
}

export type ContactSubmission = {
  name: string;
  email: string;
  organization?: string | null;
  inquiry?: string | null;
  message: string;
};

/** Sent to the team inbox when a contact form is submitted. */
export function contactNotification(d: ContactSubmission): Mail {
  const heading = `New contact enquiry — ${d.inquiry || "General"}`;
  const intro = `${d.name} submitted the contact form on codetherapy.ml. Reply straight to this email to answer them.`;
  const rows: Row[] = [
    { label: "Name", value: d.name },
    { label: "Email", value: d.email },
    { label: "Organization", value: d.organization || "—" },
    { label: "Inquiry type", value: d.inquiry || "—" },
    { label: "Received", value: new Date().toUTCString() },
  ];
  return {
    subject: `New contact enquiry from ${d.name}${d.organization ? ` (${d.organization})` : ""}`,
    html: shell({
      preheader: `${d.name}: ${d.message.slice(0, 90)}`,
      heading,
      intro,
      rows,
      body: d.message,
      footerNote: "Manage every enquiry in the admin portal under Messages.",
    }),
    text: plain(heading, intro, rows, d.message),
  };
}

/** Auto-reply sent to whoever filled in the contact form. */
export function contactAcknowledgement(d: ContactSubmission): Mail {
  const heading = "Thanks for reaching out";
  const intro = `Hi ${d.name.split(" ")[0]}, we've received your message and a member of the CodeTherapy team will get back to you within two working days. A copy of what you sent is below.`;
  const rows: Row[] = [
    { label: "Inquiry type", value: d.inquiry || "General" },
    ...(d.organization ? [{ label: "Organization", value: d.organization }] : []),
  ];
  return {
    subject: "We've received your message — CodeTherapy",
    html: shell({
      preheader: "We've received your message and will reply within two working days.",
      heading,
      intro,
      rows,
      body: d.message,
      footerNote:
        "You're receiving this because you contacted CodeTherapy. No action is needed — just reply if you want to add anything.",
    }),
    text: plain(heading, intro, rows, d.message),
  };
}

/** Sent to the team inbox on a newsletter signup. */
export function newsletterNotification(email: string): Mail {
  const heading = "New newsletter subscriber";
  const intro = "Someone subscribed to the CodeTherapy research digest.";
  const rows: Row[] = [
    { label: "Email", value: email },
    { label: "Received", value: new Date().toUTCString() },
  ];
  return {
    subject: `New newsletter subscriber: ${email}`,
    html: shell({
      preheader: `${email} subscribed to the research digest.`,
      heading,
      intro,
      rows,
      footerNote: "Subscribers are listed in the admin portal under Messages.",
    }),
    text: plain(heading, intro, rows),
  };
}

type LeadReply = {
  name: string;
  subject: string;
  body: string;
};

/** A reply composed in the admin inbox — sent to whoever submitted the lead. */
export function leadReply(d: LeadReply): Mail {
  const heading = `Re: your enquiry to CodeTherapy`;
  return {
    subject: d.subject || heading,
    html: shell({
      preheader: d.body.slice(0, 90),
      heading: d.subject || heading,
      intro: `Hi ${d.name.split(" ")[0]}, a member of the CodeTherapy team replied to your message. The response is below — just reply to this email to continue the conversation.`,
      body: d.body,
      footerNote: "You're receiving this because you contacted CodeTherapy through codetherapy.ml.",
    }),
    text: plain(d.subject || heading, `Hi ${d.name.split(" ")[0]},`, [], d.body),
  };
}

/** Welcome note sent to a new newsletter subscriber. */
export function newsletterWelcome(email: string): Mail {
  const heading = "You're on the list";
  const intro =
    "Thanks for subscribing to the CodeTherapy research digest. We send occasional updates on our open-source diagnostic models, clinical pilots and field deployments — no more than once a month.";
  return {
    subject: "You're subscribed — CodeTherapy research digest",
    html: shell({
      preheader: "Thanks for subscribing to the CodeTherapy research digest.",
      heading,
      intro,
      footerNote: `You're receiving this because ${email} was used to subscribe on codetherapy.ml. Reply to this email to unsubscribe.`,
    }),
    text: plain(heading, intro, []),
  };
}
