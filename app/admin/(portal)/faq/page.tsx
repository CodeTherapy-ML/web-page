import Link from "next/link";
import FaqManager from "@/components/admin/faq-manager";
import { db } from "@/lib/db";

export const metadata = { title: "FAQ — CodeTherapy Admin" };

export default async function AdminFaqPage() {
  const [faqs, categorySetting] = await Promise.all([
    db.faq.findMany({ orderBy: { order: "asc" } }),
    db.setting.findUnique({ where: { key: "faqCategories" } }),
  ]);

  const stored = Array.isArray(categorySetting?.value)
    ? (categorySetting.value as string[])
    : [];
  const fromFaqs = faqs.map((f) => f.category);
  const categories = Array.from(new Set([...stored, ...fromFaqs]));

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">FAQ Management</h1>
        <p className="text-sm text-gray-500">
          Manage frequently asked questions displayed on the public FAQ page.{" "}
          <Link href="/faq" target="_blank" className="font-semibold text-admin-azure hover:underline">
            View public page
          </Link>
        </p>
      </header>
      <FaqManager faqs={faqs} categories={categories} />
    </div>
  );
}
