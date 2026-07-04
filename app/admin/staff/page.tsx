// Staff management (super-admin only). Server fetches the staff list; the
// client form drives create/edit/delete via the staff Server Actions. The
// last-super-admin / self-delete guards live in the actions; the page just
// hides the UI from non-privileged roles with a notice.

import { connect } from "@/lib/db/mongoose";
import "@/models";
import { User } from "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { StaffManager } from "@/components/admin/StaffManager";
import { EmptyState } from "@/components/ui/empty-state";
import type { StaffRole } from "@/lib/constants";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  await connect();
  const user = await getCurrentUser();
  if (!user) {
    return <EmptyState title="Sign in required" />;
  }
  if (!can(user.role, "staff:manage")) {
    return <EmptyState title="No permission" description="Only super-admins can manage staff." />;
  }

  const docs = await User.find().sort({ createdAt: 1 }).lean() as unknown as {
    _id: import("mongoose").Types.ObjectId;
    name: string | null;
    email: string;
    role: string;
    active: boolean;
    image?: string | null;
    createdAt: Date;
  }[];
  const list = docs.map((d) => ({
    _id: d._id.toString(),
    name: (d.name ?? "") as string,
    email: d.email,
    role: d.role as StaffRole,
    active: Boolean(d.active),
    image: (d.image ?? "") as string,
    createdAt: d.createdAt,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
        <p className="text-sm text-muted-foreground">{list.length} account(s)</p>
      </div>
      <StaffManager
        list={list}
        currentUserId={user.id}
        currentRole={user.role}
      />
    </div>
  );
}
