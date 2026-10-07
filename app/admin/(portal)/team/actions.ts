"use server";

import bcrypt from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const memberInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().optional(),
  role: z.string().min(1),
  title: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["active", "onLeave"]),
});

export async function saveMember(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = memberInput.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, password, ...data } = parsed.data;

  const passwordHash = password
    ? await bcrypt.hash(password, 12)
    : undefined;

  try {
    if (id) {
      await db.adminUser.update({
        where: { id },
        data: { ...data, ...(passwordHash ? { passwordHash } : {}) },
      });
    } else {
      if (!passwordHash) return { error: "Password is required for new members." };
      await db.adminUser.create({ data: { ...data, passwordHash } });
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique")) {
      return { error: "That email already has an account." };
    }
    // P2025: the row was deleted while the form was open
    if (e instanceof Error && e.message.includes("P2025")) {
      return { error: "That member no longer exists — refresh the page." };
    }
    throw e;
  }

  revalidatePath("/admin/team");
  return { error: null };
}

export async function deleteMember(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.adminUser.deleteMany({ where: { id } });
  revalidatePath("/admin/team");
}

/** Public About-page team (TeamMember) — no screen exists in the Figma, so the
 *  Team screen carries a "Public Team Page" section that feeds the same table. */
const publicMemberInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  flag: z.string().max(8),
  role: z.string().min(1),
  bio: z.string().min(1),
  photo: z.string().default(""), // optional — empty renders the avatar placeholder
  order: z.coerce.number().int().min(1),
});

export async function savePublicMember(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = publicMemberInput.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...data } = parsed.data;

  try {
    if (id) {
      await db.teamMember.update({ where: { id }, data });
    } else {
      await db.teamMember.create({ data });
    }
  } catch (e) {
    // P2025: the row was deleted while the form was open
    if (e instanceof Error && e.message.includes("P2025")) {
      return { error: "That member no longer exists — refresh the page." };
    }
    throw e;
  }

  revalidateTag("team");
  revalidatePath("/about");
  revalidatePath("/admin/team");
  return { error: null };
}

export async function deletePublicMember(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.teamMember.deleteMany({ where: { id } });
  revalidateTag("team");
  revalidatePath("/about");
  revalidatePath("/admin/team");
}

/** Persists the Roles & Global Permissions matrix under the `rolePermissions` setting. */
export async function saveRolePermissions(formData: FormData): Promise<void> {
  const raw = formData.get("permissions");
  const parsed = z.record(z.string(), z.array(z.string())).safeParse(JSON.parse(String(raw)));
  if (!parsed.success) return;
  await db.setting.upsert({
    where: { key: "rolePermissions" },
    update: { value: parsed.data as never },
    create: { key: "rolePermissions", value: parsed.data as never },
  });
  revalidatePath("/admin/team");
}
