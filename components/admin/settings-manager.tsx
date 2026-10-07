"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Check, Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { clearCache, deleteSiteContent, pruneAnalytics, saveGeneralSettings } from "@/app/admin/(portal)/settings/actions";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/admin/confirm-dialog";

type Settings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  primaryAccent: string;
  secondaryAccent: string;
  standardLogo: string;
  darkModeLogo: string;
  socialLinks: { twitter: string; linkedin: string; github: string; youtube: string };
  contactEmail: string;
  notifications: {
    emailOnComment: boolean;
    emailOnFormSubmission: boolean;
    weeklyAnalyticsDigest: boolean;
    draftReminder7Days: boolean;
  };
  integrations: { smtp: boolean; cloudinary: boolean };
  users: { id: string; name: string; email: string; role: string; status: string }[];
};

const TABS = ["General", "SEO", "Users", "Integrations", "Backups"];

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none focus:border-admin-azure";
const labelClass = "text-[13px] font-semibold text-gray-600";

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-admin-azure bg-admin-azure" : "border-gray-400 bg-transparent",
        )}
      >
        {checked && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-[13px] text-gray-600">{label}</span>
    </label>
  );
}

export default function SettingsManager({ settings }: { settings: Settings }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("General");
  const [confirmNuke, setConfirmNuke] = useState(false);
  const [nukePending, setNukePending] = useState(false);
  const [formState, formAction] = useFormState(saveGeneralSettings, { ok: true });

  // General form state — seeded from DB settings.
  const resetGeneral = () => {
    setSiteName(settings.siteName);
    setSiteDescription(settings.siteDescription);
    setSiteUrl(settings.siteUrl);
    setPrimaryAccent(settings.primaryAccent);
    setSecondaryAccent(settings.secondaryAccent);
    setContactEmail(settings.contactEmail);
    setSocial(settings.socialLinks);
    setNotifications(settings.notifications);
  };

  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [siteUrl, setSiteUrl] = useState(settings.siteUrl);
  const [primaryAccent, setPrimaryAccent] = useState(settings.primaryAccent);
  const [secondaryAccent, setSecondaryAccent] = useState(settings.secondaryAccent);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [social, setSocial] = useState(settings.socialLinks);
  const [notifications, setNotifications] = useState(settings.notifications);

  // Show the unsaved-changes bar only when something actually differs from
  // the values loaded from the database.
  const dirty =
    siteName !== settings.siteName ||
    siteDescription !== settings.siteDescription ||
    siteUrl !== settings.siteUrl ||
    primaryAccent !== settings.primaryAccent ||
    secondaryAccent !== settings.secondaryAccent ||
    contactEmail !== settings.contactEmail ||
    JSON.stringify(social) !== JSON.stringify(settings.socialLinks) ||
    JSON.stringify(notifications) !== JSON.stringify(settings.notifications);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ---------------------------------------------------- tabs */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <div className="flex flex-wrap gap-6 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 pb-3 text-sm transition-colors",
                tab === t
                  ? "border-admin-azure font-bold text-admin-azure"
                  : "border-transparent font-medium text-gray-600 hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------- general */}
      {tab === "General" && (
        <form action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:gap-16">
            {/* ----------------------------------------- left column */}
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-bold text-ink">Site Information</h2>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Site Name</span>
                  <input
                    name="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Site Description</span>
                  <textarea
                    name="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="h-20 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-admin-azure"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Site URL</span>
                  <input
                    name="siteUrl"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <Image src="/icon.png" alt="" width={28} height={28} className="rounded-md" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-ink">Favicon</span>
                    <span className="text-xs text-gray-500">
                      Click to upload new favicon (SVG or PNG, max 100KB)
                    </span>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-bold text-ink">Branding</h2>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className={labelClass}>Primary Accent</span>
                    <span className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3">
                      <span
                        className="size-[18px] shrink-0 rounded"
                        style={{ backgroundColor: primaryAccent }}
                        aria-hidden
                      />
                      <input
                        name="primaryAccent"
                        value={primaryAccent}
                        onChange={(e) => setPrimaryAccent(e.target.value)}
                        className="w-full bg-transparent text-sm text-ink outline-none"
                      />
                    </span>
                  </label>
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className={labelClass}>Secondary Accent</span>
                    <span className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3">
                      <span
                        className="size-[18px] shrink-0 rounded"
                        style={{ backgroundColor: secondaryAccent }}
                        aria-hidden
                      />
                      <input
                        name="secondaryAccent"
                        value={secondaryAccent}
                        onChange={(e) => setSecondaryAccent(e.target.value)}
                        className="w-full bg-transparent text-sm text-ink outline-none"
                      />
                    </span>
                  </label>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className={labelClass}>Standard Logo</span>
                    <span className="flex h-[60px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <Image
                        src={settings.standardLogo}
                        alt="Standard logo"
                        width={90}
                        height={24}
                        className="object-contain"
                      />
                    </span>
                    <input type="hidden" name="standardLogo" value={settings.standardLogo} />
                  </label>
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className={labelClass}>Dark Mode Logo</span>
                    <span className="flex h-[60px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-ink-deep">
                      <Image
                        src={settings.darkModeLogo}
                        alt="Dark mode logo"
                        width={90}
                        height={24}
                        className="object-contain"
                      />
                    </span>
                    <input type="hidden" name="darkModeLogo" value={settings.darkModeLogo} />
                  </label>
                </div>
              </section>
            </div>

            {/* ----------------------------------------- right column */}
            <div className="flex w-full shrink-0 flex-col gap-6 xl:w-[516px]">
              <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-bold text-ink">Social Media Links</h2>
                {(
                  [
                    ["twitter", "Twitter", Twitter],
                    ["linkedin", "LinkedIn", Linkedin],
                    ["github", "GitHub", Github],
                    ["youtube", "YouTube", Youtube],
                  ] as const
                ).map(([key, label, Icon]) => (
                  <label
                    key={key}
                    className="flex h-10 items-center gap-2.5 rounded-lg border border-gray-200 px-3"
                  >
                    <Icon className="size-4 shrink-0 text-gray-400" />
                    <input
                      name={key}
                      value={social[key]}
                      onChange={(e) =>
                        setSocial((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm text-ink outline-none"
                      aria-label={`${label} URL`}
                    />
                  </label>
                ))}
              </section>

              <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-bold text-ink">Email &amp; Notifications</h2>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Contact Email Address</span>
                  <input
                    name="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <Checkbox
                    checked={notifications.emailOnComment}
                    onChange={(v) =>
                      setNotifications((prev) => ({ ...prev, emailOnComment: v }))
                    }
                    label="Email on new comment"
                  />
                  <Checkbox
                    checked={notifications.emailOnFormSubmission}
                    onChange={(v) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailOnFormSubmission: v,
                      }))
                    }
                    label="Email on form submission"
                  />
                  <Checkbox
                    checked={notifications.weeklyAnalyticsDigest}
                    onChange={(v) =>
                      setNotifications((prev) => ({
                        ...prev,
                        weeklyAnalyticsDigest: v,
                      }))
                    }
                    label="Weekly analytics digest"
                  />
                  <Checkbox
                    checked={notifications.draftReminder7Days}
                    onChange={(v) =>
                      setNotifications((prev) => ({ ...prev, draftReminder7Days: v }))
                    }
                    label="Draft reminder after 7 days"
                  />
                  <input
                    type="hidden"
                    name="emailOnComment"
                    value={String(notifications.emailOnComment)}
                  />
                  <input
                    type="hidden"
                    name="emailOnFormSubmission"
                    value={String(notifications.emailOnFormSubmission)}
                  />
                  <input
                    type="hidden"
                    name="weeklyAnalyticsDigest"
                    value={String(notifications.weeklyAnalyticsDigest)}
                  />
                  <input
                    type="hidden"
                    name="draftReminder7Days"
                    value={String(notifications.draftReminder7Days)}
                  />
                </div>
              </section>

              <section className="flex flex-col gap-4 rounded-xl border-[1.5px] border-dashed border-admin-navy bg-white p-5">
                <h2 className="font-bold text-admin-navy">Danger Zone</h2>
                <p className="text-[13px] text-gray-600">
                  Actions are permanent. Please proceed with utmost caution.
                </p>
                <div className="flex flex-wrap gap-3">
                  <form action={clearCache}>
                    <button className="h-9 rounded-lg border border-gray-200 px-3.5 text-[13px] font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure">
                      Clear Cache
                    </button>
                  </form>
                  <Link
                    href="/admin/api/export"
                    className="flex h-9 items-center rounded-lg border border-gray-200 px-3.5 text-[13px] font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure"
                  >
                    Export All Data
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmNuke(true)}
                    className="h-9 rounded-lg border border-red-600 bg-[#fee2e2] px-3.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-[#fecaca]"
                  >
                    Delete Site
                  </button>
                </div>
              </section>
            </div>
          </div>

          <ConfirmDialog
            open={confirmNuke}
            title="Delete ALL site content?"
            description="Every project, article, team member, partnership, FAQ and media record is removed. This cannot be undone — export your data first."
            confirmLabel="Delete everything"
            pending={nukePending}
            onCancel={() => setConfirmNuke(false)}
            onConfirm={async () => {
              setNukePending(true);
              try {
                await deleteSiteContent();
                toast({ title: "Site content deleted", variant: "destructive" });
              } finally {
                setNukePending(false);
                setConfirmNuke(false);
              }
            }}
          />

          {/* Full-width unsaved-changes bar — only when the form is dirty */}
          {dirty && (
            <div className="sticky bottom-0 z-10 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(30,34,41,0.06)]">
              <p className="text-sm text-gray-600">You have unsaved branding changes.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetGeneral}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
                >
                  Discard
                </button>
                <SaveChangesButton ok={formState.ok} />
              </div>
            </div>
          )}
        </form>
      )}

      {/* ------------------------------------------------------- SEO */}
      {tab === "SEO" && (
        <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 font-bold text-ink">Search Engine Settings</h2>
          <p className="mb-5 text-sm text-gray-500">
            Defaults for page titles, descriptions and sharing previews. Individual
            articles and projects override these.
          </p>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Site name</dt>
              <dd className="font-semibold text-ink">{settings.siteName}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Description</dt>
              <dd className="max-w-[360px] truncate font-semibold text-ink">
                {settings.siteDescription}
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Sitemap</dt>
              <dd className="font-semibold text-admin-azure">
                <Link href="/sitemap.xml" target="_blank" className="hover:underline">
                  /sitemap.xml
                </Link>
              </dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">Robots</dt>
              <dd className="font-semibold text-ink">Admin portal excluded (noindex)</dd>
            </div>
          </dl>
        </div>
      )}

      {/* ------------------------------------------------------ Users */}
      {tab === "Users" && (
        <div className="max-w-3xl rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-2 py-3">Email</th>
                <th className="px-2 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {settings.users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{user.name}</td>
                  <td className="px-2 py-3 text-gray-500">{user.email}</td>
                  <td className="px-2 py-3 capitalize text-gray-500">{user.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-semibold",
                        user.status === "active"
                          ? "bg-[#e2f4fd] text-admin-azure"
                          : "bg-[#e7ecf1] text-admin-navy",
                      )}
                    >
                      {user.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------ Integrations */}
      {tab === "Integrations" && (
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-bold text-ink">Service Connections</h2>
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 text-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-semibold text-ink">SMTP Email</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  settings.integrations.smtp ? "text-admin-azure" : "text-admin-navy",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    settings.integrations.smtp ? "bg-admin-azure" : "bg-admin-navy",
                  )}
                />
                {settings.integrations.smtp ? "Connected" : "Not configured"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Cloudinary Media Storage</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  settings.integrations.cloudinary ? "text-admin-azure" : "text-admin-navy",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    settings.integrations.cloudinary ? "bg-admin-azure" : "bg-admin-navy",
                  )}
                />
                {settings.integrations.cloudinary ? "Connected" : "Not configured"}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Configure these in the project&apos;s .env — see .env.example.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- Backups */}
      {tab === "Backups" && (
        <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 font-bold text-ink">Backups &amp; Maintenance</h2>
          <p className="mb-5 text-sm text-gray-500">
            Export every content table as JSON, or run maintenance actions.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/api/export"
              className="flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure"
            >
              Export All Data (JSON)
            </Link>
            <form
              action={async () => {
                const result = await pruneAnalytics();
                toast({
                  title: `Pruned ${result.deleted} pageview row${result.deleted === 1 ? "" : "s"}`,
                  description: `History preserved in ${result.monthsAggregated} monthly aggregate${result.monthsAggregated === 1 ? "" : "s"}.`,
                });
              }}
            >
              <button className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure">
                Prune Analytics (6-month retention)
              </button>
            </form>
            <form action={clearCache}>
              <button className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-admin-azure hover:text-admin-azure">
                Clear Cache
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveChangesButton({ ok }: { ok: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save Changes"}
    </button>
  );
}
