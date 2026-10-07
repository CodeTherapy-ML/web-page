"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  deleteMember,
  deletePublicMember,
  saveMember,
  savePublicMember,
  saveRolePermissions,
} from "@/app/admin/(portal)/team/actions";
import ImageUploadField from "@/components/admin/image-upload-field";
import MemberAvatar from "@/components/member-avatar";
import DeleteButton from "@/components/admin/delete-button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  department: string;
  status: string;
};

type PublicMember = {
  id: string;
  name: string;
  flag: string;
  role: string;
  bio: string;
  photo: string;
  order: number;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-ink outline-none focus:border-admin-azure";

const PERMISSIONS = ["create", "edit", "publish", "delete"] as const;
const ROLES = [
  { name: "admin", label: "Admin" },
  { name: "editor", label: "Editor" },
];

const defaultPerms: Record<string, string[]> = {
  admin: ["create", "edit", "publish", "delete"],
  editor: ["create", "edit"],
};

export default function TeamManager({
  members,
  publicMembers,
  rolePermissions,
}: {
  members: Member[];
  publicMembers: PublicMember[];
  rolePermissions: Record<string, string[]> | null;
}) {
  const [editing, setEditing] = useState<Member | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingPublic, setEditingPublic] = useState<PublicMember | null>(null);
  const [perms, setPerms] = useState<Record<string, string[]>>(
    rolePermissions ?? defaultPerms,
  );

  return (
    <div className="flex flex-col gap-8">
      {/* --------------------------------------------- staff directory */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-ink">Team Directory</h1>
            <p className="text-sm text-gray-500">
              Configure administrative access, staff departments, and granular system privileges.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            className="flex items-center gap-2 rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep"
          >
            <Plus className="size-4" />
            Add Member
          </button>
        </div>

        {(adding || editing) && (
          <MemberForm
            key={editing?.id ?? "new"}
            member={editing}
            onClose={() => {
              setAdding(false);
              setEditing(null);
            }}
          />
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Member</th>
                <th className="px-2 py-3">Title</th>
                <th className="px-2 py-3">Department</th>
                <th className="px-2 py-3">Email</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-ink">
                        {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <span className="font-semibold text-ink">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-gray-500">{member.title || "—"}</td>
                  <td className="px-2 py-3 text-gray-500">{member.department || "—"}</td>
                  <td className="px-2 py-3 text-gray-500">{member.email}</td>
                  <td className="px-2 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-1 text-xs font-semibold",
                        member.status === "active"
                          ? "bg-[#e2f4fd] text-admin-azure"
                          : "bg-[#e7ecf1] text-admin-navy",
                      )}
                    >
                      {member.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(member);
                          setAdding(false);
                        }}
                        aria-label={`Edit ${member.name}`}
                        className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-ink"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <DeleteButton
                        action={deleteMember}
                        id={member.id}
                        title={`Delete ${member.name}?`}
                        description="Their account and access to this portal are removed. This cannot be undone."
                        ariaLabel={`Delete ${member.name}`}
                        className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </DeleteButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* -------------------------------------- public About-page team */}
      <section>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-xl font-bold text-ink">Public Team Page</h2>
          <p className="text-sm text-gray-500">
            Members shown on the public About page (TeamMember table) — order, photo
            and bio all feed the page directly.
          </p>
        </div>

        {editingPublic !== null && (
          <PublicMemberForm key={editingPublic?.id ?? "new"} member={editingPublic} onClose={() => setEditingPublic(null)} />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publicMembers.map((m) => (
            <article key={m.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.name} src={m.photo} className="size-11 rounded-full" />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-ink">
                    {m.name} <span aria-hidden>{m.flag}</span>
                  </h3>
                  <p className="text-xs font-semibold uppercase text-admin-azure">{m.role}</p>
                </div>
              </div>
              <p className="line-clamp-2 text-xs text-gray-500">{m.bio}</p>
              <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">Order: {m.order}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingPublic(m)}
                    aria-label={`Edit ${m.name}`}
                    className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-ink"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <DeleteButton
                    action={deletePublicMember}
                    id={m.id}
                    title={`Remove ${m.name} from the public team?`}
                    description="They disappear from the About page immediately. This cannot be undone."
                    confirmLabel="Remove"
                    ariaLabel={`Delete ${m.name}`}
                    className="rounded bg-gray-100 p-2 text-gray-500 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </DeleteButton>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingPublic({
              id: "",
              name: "",
              flag: "",
              role: "",
              bio: "",
              photo: "",
              order: publicMembers.length + 1,
            })
          }
          className="mt-4 flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-admin-azure hover:text-admin-azure"
        >
          <Plus className="size-3.5" />
          Add Team Member
        </button>
      </section>

      {/* ----------------------------------- roles & global permissions */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-ink">Roles &amp; Global Permissions</h2>
        <p className="mb-4 text-sm text-gray-500">
          Control what actions different account tiers can execute across projects,
          publications, and content.
        </p>
        <form action={saveRolePermissions}>
          <input type="hidden" name="permissions" value={JSON.stringify(perms)} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-2">Role Name</th>
                  {PERMISSIONS.map((p) => (
                    <th key={p} className="px-2 py-2 capitalize">
                      {p}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right">Assigned Users</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((role) => (
                  <tr key={role.name} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-3 font-semibold text-ink">{role.label}</td>
                    {PERMISSIONS.map((perm) => (
                      <td key={perm} className="px-2 py-3">
                        <input
                          type="checkbox"
                          checked={perms[role.name]?.includes(perm) ?? false}
                          onChange={(e) =>
                            setPerms((prev) => ({
                              ...prev,
                              [role.name]: e.target.checked
                                ? [...(prev[role.name] ?? []), perm]
                                : (prev[role.name] ?? []).filter((x) => x !== perm),
                            }))
                          }
                          aria-label={`${role.label} can ${perm}`}
                          className="size-4 rounded accent-admin-azure"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-3 text-right text-gray-500">
                      {members.filter((m) => m.role === role.name).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-admin-azure px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-azure-deep"
          >
            Save Permissions
          </button>
        </form>
      </section>
    </div>
  );
}

function MemberForm({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(saveMember, { error: null });
  const submittedRef = useRef(false);
  const { toast } = useToast();

  // Close only when the save actually succeeded; on error the form stays open
  // so the returned message is visible.
  useEffect(() => {
    if (!submittedRef.current) return;
    submittedRef.current = false;
    if (state.error === null) {
      toast({ title: member ? "Member updated" : "Member added" });
      onClose();
    }
  }, [state, member, onClose, toast]);

  return (
    <form
      action={(fd) => {
        submittedRef.current = true;
        formAction(fd);
      }}
      className="mb-4 rounded-xl border border-admin-azure/40 bg-[#f4f8fb] p-5"
    >
      {member && <input type="hidden" name="id" value={member.id} />}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-ink">
          {member ? `Edit ${member.name}` : "Add Member"}
        </h3>
        <button type="button" onClick={onClose} aria-label="Close form">
          <X className="size-4 text-gray-400 hover:text-ink" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Name</span>
          <input name="name" required defaultValue={member?.name} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Email</span>
          <input name="email" required type="email" defaultValue={member?.email} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Password{member ? " (leave blank to keep)" : ""}</span>
          <input name="password" type="password" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Role</span>
          <select name="role" defaultValue={member?.role ?? "admin"} className={inputClass}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Title</span>
          <input name="title" defaultValue={member?.title} placeholder="e.g. Co-Founder & CTO" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Department</span>
          <input name="department" defaultValue={member?.department} placeholder="e.g. Machine Learning" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Status</span>
          <select name="status" defaultValue={member?.status ?? "active"} className={inputClass}>
            <option value="active">Active</option>
            <option value="onLeave">On Leave</option>
          </select>
        </label>
      </div>
      {state.error && <p className="mt-2 text-xs font-semibold text-red-600">{state.error}</p>}
      <SubmitButton>{member ? "Save Changes" : "Add Member"}</SubmitButton>
    </form>
  );
}


function PublicMemberForm({
  member,
  onClose,
}: {
  member: PublicMember | null;
  onClose: () => void;
}) {
  const [state, formAction] = useFormState(savePublicMember, { error: null });
  const submittedRef = useRef(false);
  const { toast } = useToast();

  // Close only when the save actually succeeded; on error the form stays open
  // so the returned message is visible.
  useEffect(() => {
    if (!submittedRef.current) return;
    submittedRef.current = false;
    if (state.error === null) {
      toast({ title: member?.id ? "Team member updated" : "Team member added" });
      onClose();
    }
  }, [state, member, onClose, toast]);

  return (
    <form
      action={(fd) => {
        submittedRef.current = true;
        formAction(fd);
      }}
      className="mb-4 rounded-xl border border-admin-azure/40 bg-[#f4f8fb] p-5"
    >
      {member?.id ? <input type="hidden" name="id" value={member.id} /> : null}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-ink">
          {member?.id ? `Edit ${member.name}` : "Add Team Member"}
        </h3>
        <button type="button" onClick={onClose} aria-label="Close form">
          <X className="size-4 text-gray-400 hover:text-ink" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Name</span>
          <input name="name" required defaultValue={member?.name} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Flag (emoji)</span>
          <input name="flag" defaultValue={member?.flag} placeholder="🇳🇬" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Role</span>
          <input name="role" required defaultValue={member?.role} placeholder="e.g. CTO" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">Order</span>
          <input type="number" name="order" min={1} defaultValue={member?.order ?? 1} className={inputClass} />
        </label>
        <ImageUploadField
          name="photo"
          label="Photo"
          defaultValue={member?.photo}
          hint="Optional — members without a photo get the avatar placeholder."
          previewClassName="h-36 w-36"
          placeholder="avatar"
          className="col-span-2 md:col-span-1"
        />
        <label className="col-span-2 flex flex-col gap-1 md:col-span-3">
          <span className="text-xs font-semibold text-gray-600">Bio</span>
          <input name="bio" required defaultValue={member?.bio} className={inputClass} />
        </label>
      </div>
      {state.error && <p className="mt-2 text-xs font-semibold text-red-600">{state.error}</p>}
      <SubmitButton>{member?.id ? "Save Changes" : "Add Member"}</SubmitButton>
    </form>
  );
}

/** Submits the form and disables itself while the server action is in flight. */
function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 rounded-lg bg-admin-azure px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-azure-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
