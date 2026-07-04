"use client";

// Delete button with an inline confirm. Used inside admin rows. Calls a
// Server Action that matches the (id) -> ActionResult shape. Optimistic by
// way of refresh() (the action revalidates, so the page re-fetches).

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  id,
  action,
  label = "Delete",
  confirm = "Are you sure? This cannot be undone.",
  redirectAfter,
  variant = "ghost",
}: {
  id: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  label?: string;
  confirm?: string;
  redirectAfter?: string;
  variant?: "ghost" | "destructive" | "outline";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirm)) return;
        start(async () => {
          const res = await action(id);
          if (res.ok) {
            toast.success("Deleted");
            if (redirectAfter) router.push(redirectAfter);
            router.refresh();
          } else {
            toast.error(res.error ?? "Delete failed");
          }
        });
      }}
    >
      <Trash2 className="h-4 w-4" /> {label}
    </Button>
  );
}
