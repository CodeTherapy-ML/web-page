import SettingsManager from "@/components/admin/settings-manager";
import { db } from "@/lib/db";

export const metadata = { title: "Settings — CodeTherapy Admin" };

export default async function AdminSettingsPage() {
  const [allSettings, users] = await Promise.all([
    db.setting.findMany(),
    db.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const get = <T,>(key: string, fallback: T): T => {
    const row = allSettings.find((s) => s.key === key);
    return (row?.value as T) ?? fallback;
  };

  const settings = {
    siteName: get("siteName", "CodeTherapy"),
    siteDescription: get(
      "siteDescription",
      "Pioneering open-source AI diagnostics for the last mile.",
    ),
    siteUrl: get("siteUrl", "https://codetherapy.ml"),
    primaryAccent: get("primaryAccent", "#00719D"),
    secondaryAccent: get("secondaryAccent", "#0B3C5D"),
    standardLogo: get("standardLogo", "/brand/wordmark-light.png"),
    darkModeLogo: get("darkModeLogo", "/brand/wordmark-dark.png"),
    socialLinks: get("socialLinks", {
      twitter: "https://twitter.com/codetherapy",
      linkedin: "https://linkedin.com/company/codetherapy-labs",
      github: "https://github.com/CodeTherapy-ML",
      youtube: "https://youtube.com/c/codetherapy",
    }),
    contactEmail: get("contactEmail", "contact@codetherapy.ml"),
    notifications: get("notifications", {
      emailOnComment: true,
      emailOnFormSubmission: true,
      weeklyAnalyticsDigest: false,
      draftReminder7Days: true,
    }),
    integrations: {
      smtp: Boolean(process.env.SMTP_HOST),
      cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    },
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
    })),
  };

  return <SettingsManager settings={settings} />;
}
