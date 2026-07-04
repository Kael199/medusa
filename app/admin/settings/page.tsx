// Settings page (super-admin only). Renders + submits the site settings
// singleton form. Announcements are stored as an array but edited as a
// newline-separated textarea.

import { connect } from "@/lib/db/mongoose";
import "@/models";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { can } from "@/lib/auth/rbac";
import { getSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { EmptyState } from "@/components/ui/empty-state";
import { READER_MODES, type ReaderMode } from "@/lib/constants";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await connect();
  const user = await getCurrentUser();
  if (!user) {
    return <EmptyState title="Sign in required" />;
  }
  if (!can(user.role, "settings:manage")) {
    return <EmptyState title="No permission" description="Only super-admins can edit settings." />;
  }

  const res = await getSettings();
  if (!res.ok) {
    return <EmptyState title="Error" description={res.error} />;
  }
  const s = res.data;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Global site configuration.</p>
      </div>
      <SettingsForm
        initialValues={{
          siteName: s.siteName,
          tagline: s.tagline,
          defaultReaderMode: s.defaultReaderMode as ReaderMode,
          footerText: s.footerText,
          maintenanceMode: s.maintenanceMode,
          announcements: (s.announcements ?? []).join("\n"),
        }}
        readerModes={READER_MODES as unknown as ReaderMode[]}
      />
    </div>
  );
}
