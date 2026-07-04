"use server";

// Staff (user) management Server Actions. Super-admin only (staff:manage).
// Two guards unique to staff: the LAST active super-admin cannot be demoted,
// disabled, or deleted — preserve admin access to the system. A user can never
// delete their own account here either. Passwords are hashed via the
// User pre-save hook (lib/auth/password.ts) which hashes plain-text values.

import { Types } from "mongoose";

import "@/models";
import { connect } from "@/lib/db/mongoose";
import { User, type UserDoc } from "@/models";
import { requireCan, requireUser } from "@/lib/auth/assert";
import { asActionError, type ActionResult } from "@/lib/actions/_shared";
import { STAFF_ROLES, type StaffRole } from "@/lib/constants";
import { revalidateStaff } from "@/lib/utils/revalidate";

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  active?: boolean;
}

export interface UpdateStaffInput {
  name?: string;
  role?: StaffRole;
  active?: boolean;
  password?: string;
}

function toObjectId(s: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

function validRole(r: string): r is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(r);
}

async function countActiveSuperAdmins(): Promise<number> {
  return User.countDocuments({ role: "super-admin", active: true });
}

export async function listStaff(): Promise<
  ActionResult<{
    _id: string;
    name: string;
    email: string;
    role: StaffRole;
    active: boolean;
    image: string;
    createdAt: Date;
  }[]>
> {
  try {
    await connect();
    await requireCan("staff:manage");

    const docs = await User.find().sort({ createdAt: 1 }).lean();
    return {
      ok: true,
      data: docs.map((d) => ({
        _id: (d as unknown as UserDoc)._id.toString(),
        name: d.name,
        email: d.email,
        role: d.role,
        active: d.active,
        image: d.image ?? "",
        createdAt: d.createdAt,
      })),
    };
  } catch (e) {
    return asActionError(e);
  }
}

export async function createStaff(
  input: CreateStaffInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    await requireCan("staff:manage");

    if (!input.email || !input.email.includes("@")) {
      return { ok: false, error: "A valid email is required" };
    }
    if (!input.password || input.password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters" };
    }
    if (!validRole(input.role)) {
      return { ok: false, error: "Invalid role" };
    }

    try {
      const doc = await User.create({
        name: input.name?.trim() ?? "",
        email: input.email.toLowerCase().trim(),
        password: input.password, // pre("save") hashes plain text
        role: input.role,
        active: input.active ?? true,
      });
      revalidateStaff();
      return { ok: true, data: { id: doc._id.toString() } };
    } catch (e) {
      if (e instanceof Error && /duplicate key|E11000/i.test(e.message)) {
        return { ok: false, error: "A staff account with that email already exists" };
      }
      throw e;
    }
  } catch (e) {
    return asActionError(e);
  }
}

export async function updateStaff(
  id: string,
  input: UpdateStaffInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("staff:manage");

    const oid = toObjectId(id);
    if (!oid) return { ok: false, error: "Invalid id" };

    const existing = (await User.findById(oid).lean()) as UserDoc | null;
    if (!existing) return { ok: false, error: "Staff member not found" };

    const update: Record<string, unknown> = {};
    if (input.name !== undefined) update.name = input.name.trim();
    if (input.password !== undefined) {
      if (input.password.length < 8) {
        return { ok: false, error: "Password must be at least 8 characters" };
      }
      update.password = input.password; // pre("save") hashes; we use updateOne so re-hash manually
    }

    // Last-super-admin guards.
    const losingSuperAdmin =
      (input.role !== undefined && input.role !== "super-admin" && existing.role === "super-admin") ||
      (input.active === false && existing.role === "super-admin" && existing.active);

    if (losingSuperAdmin) {
      const remaining = (await countActiveSuperAdmins()) - 1;
      if (remaining < 1) {
        return { ok: false, error: "Cannot remove the last active super-admin" };
      }
    }

    if (input.role !== undefined) {
      if (!validRole(input.role)) return { ok: false, error: "Invalid role" };
      update.role = input.role;
    }
    if (input.active !== undefined) update.active = Boolean(input.active);

    if (Object.keys(update).length === 0) {
      return { ok: true, data: { id } };
    }

    // UpdateOne bypasses the pre("save") hook, so hash password here.
    if (update.password) {
      const { hashPassword } = await import("@/lib/auth/password");
      update.password = await hashPassword(String(update.password));
    }

    await User.updateOne({ _id: oid }, { $set: update });

    revalidateStaff();
    return { ok: true, data: { id } };
  } catch (e) {
    return asActionError(e);
  }
}

export async function deleteStaff(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await connect();
    const user = await requireCan("staff:manage");

    if (user.id === id) {
      return { ok: false, error: "You cannot delete your own account" };
    }

    const oid = toObjectId(id);
    if (!oid) return { ok: false, error: "Invalid id" };

    const existing = (await User.findById(oid).lean()) as UserDoc | null;
    if (!existing) return { ok: false, error: "Staff member not found" };

    if (existing.role === "super-admin") {
      const remaining = (await countActiveSuperAdmins()) - 1;
      if (remaining < 1) {
        return { ok: false, error: "Cannot delete the last active super-admin" };
      }
    }

    await User.deleteOne({ _id: oid });
    revalidateStaff();
    return { ok: true, data: { id } };
  } catch (e) {
    return asActionError(e);
  }
}

// Convenience: surface the current actor so admin pages can guard UI.
export { requireUser };
