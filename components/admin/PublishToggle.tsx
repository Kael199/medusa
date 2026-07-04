"use client";

// Toggles for manga/chapter published/hidden states inside admin tables.
// Pure client button: reflects current value and fires the right Server
// Action on click. Server pages render these only when the role has the
// matching permission, and the server action re-checks.

import { useTransition } from "react";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";

export function PublishToggle({
  id,
  published,
  action,
}: {
  id: string;
  published: boolean;
  action: (id: string, published: boolean) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={published}
      disabled={pending}
      onCheckedChange={(checked) => {
        start(async () => {
          const res = await action(id, checked);
          if (!res.ok) toast.error(res.error ?? "Failed to update");
          else toast.success(checked ? "Published" : "Unpublished");
        });
      }}
      aria-label="Toggle published"
    />
  );
}
