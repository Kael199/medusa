"use client";

// Staff CRUD manager. Lists accounts and provides dialogs for create/edit +
// delete. Passwords are never shown — the edit dialog has an optional
// password field that, when filled, triggers a reset. Delete is double-
// guarded client-side; the action enforces the last-super-admin / self rules.

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  createStaff, updateStaff, deleteStaff,
} from "@/lib/actions/staff";
import { STAFF_ROLES, type StaffRole } from "@/lib/constants";

export interface StaffItem {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  createdAt: Date;
}

export function StaffManager({
  list,
  currentUserId,
  currentRole,
}: {
  list: StaffItem[];
  currentUserId: string;
  currentRole: StaffRole;
}) {
  void currentRole;
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateDialog onCreated={refresh} currentUserId={currentUserId} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No staff accounts.
                </TableCell>
              </TableRow>
            )}
            {list.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{s.email}</TableCell>
                <TableCell>
                  <Badge variant={s.role === "super-admin" ? "default" : "secondary"}>{s.role}</Badge>
                </TableCell>
                <TableCell>
                  {s.active ? (
                    <Badge variant="success">active</Badge>
                  ) : (
                    <Badge variant="outline">disabled</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditDialog staff={s} currentUserId={currentUserId} onSaved={refresh} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(s, currentUserId)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  function refresh() {
    router.refresh();
  }

  async function handleDelete(s: StaffItem, currentUserId: string) {
    if (s._id === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!window.confirm(`Delete ${s.email}? This cannot be undone.`)) return;
    const res = await deleteStaff(s._id);
    if (res.ok) {
      toast.success("Deleted");
      refresh();
    } else {
      toast.error(res.error ?? "Delete failed");
    }
  }
}

function CreateDialog({ onCreated, currentUserId }: { onCreated: () => void; currentUserId: string }) {
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<StaffRole>("uploader");
  const [active, setActive] = React.useState(true);

  void currentUserId;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("A valid email is required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    start(async () => {
      const res = await createStaff({ name, email, password, role, active });
      if (res.ok) {
        toast.success("Staff member created");
        setOpen(false);
        setName(""); setEmail(""); setPassword(""); setRole("uploader"); setActive(true);
        onCreated();
      } else {
        toast.error(res.error ?? "Create failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New staff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create staff account</DialogTitle>
          <DialogDescription>Add a new editor, uploader, or super-admin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="n">Name</Label>
            <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e">Email</Label>
            <Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Password (min 8 chars)</Label>
            <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="a">Active</Label>
            <Switch id="a" checked={active} onCheckedChange={setActive} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  staff,
  currentUserId,
  onSaved,
}: {
  staff: StaffItem;
  currentUserId: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [name, setName] = React.useState(staff.name);
  const [role, setRole] = React.useState<StaffRole>(staff.role);
  const [active, setActive] = React.useState(staff.active);
  const [password, setPassword] = React.useState("");

  void currentUserId;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const patch: Parameters<typeof updateStaff>[1] = {
        name,
        role,
        active,
      };
      if (password) {
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        patch.password = password;
      }
      const res = await updateStaff(staff._id, patch);
      if (res.ok) {
        toast.success("Updated");
        setOpen(false);
        setPassword("");
        onSaved();
      } else {
        toast.error(res.error ?? "Update failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {staff.email}</DialogTitle>
          <DialogDescription>Leave password blank to keep it unchanged.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <div className="space-y-2">
            <Label>New password (optional)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Unchanged" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
