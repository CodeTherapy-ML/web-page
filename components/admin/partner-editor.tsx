"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowLeft } from "lucide-react";
import { savePartner } from "@/app/admin/(portal)/partnerships/actions";

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none focus:border-admin-azure";
const labelClass = "text-[13px] font-semibold text-gray-600";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-admin-azure px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save Partner"}
    </button>
  );
}

export default function PartnerEditor({
  partner,
}: {
  partner?: {
    id: string;
    initial: string;
    name: string;
    region: string;
    type: string;
    body: string;
    category: string;
    affiliationStatus: string;
    startDate: string;
    contact: string;
  } | null;
}) {
  const [state, formAction] = useFormState(savePartner, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-6 p-6">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <Link
        href="/admin/partnerships"
        className="self-start text-sm font-semibold text-admin-azure hover:underline"
      >
        ← Back to Partnerships
      </Link>
      <h1 className="text-2xl font-bold text-ink">
        {partner ? `Edit ${partner.name}` : "Add Partner"}
      </h1>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Initial</span>
            <input name="initial" required maxLength={2} defaultValue={partner?.initial} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Name</span>
            <input name="name" required defaultValue={partner?.name} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Region</span>
            <input name="region" required defaultValue={partner?.region} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Type</span>
            <select name="type" defaultValue={partner?.type ?? "Research Partner"} className={inputClass}>
              <option>Research Partner</option>
              <option>Clinical Partner</option>
              <option>Strategic Partner</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Category</span>
            <select name="category" defaultValue={partner?.category ?? "Academic"} className={inputClass}>
              <option>Academic</option>
              <option>Healthcare</option>
              <option>Technology</option>
              <option>NGO</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Affiliation Status</span>
            <select name="affiliationStatus" defaultValue={partner?.affiliationStatus ?? "Active"} className={inputClass}>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Start Date</span>
            <input name="startDate" required defaultValue={partner?.startDate} placeholder="Jan 12, 2023" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Primary Contact</span>
            <input name="contact" required defaultValue={partner?.contact} placeholder="Dr. Rachel Green" className={inputClass} />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5">
            <span className={labelClass}>Description</span>
            <textarea
              name="body"
              required
              rows={3}
              defaultValue={partner?.body}
              className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-admin-azure"
            />
          </label>
        </div>
        <div className="mt-5">
          <SaveButton />
        </div>
      </div>
    </form>
  );
}
