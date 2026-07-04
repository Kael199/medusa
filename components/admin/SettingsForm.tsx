"use client";

// Settings editor. Site name, tagline, default reader mode, footer text,
// maintenance mode, and announcements (newline-separated). Submits via the
// updateSettings Server Action and toasts the result.

import * as React from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateSettings } from "@/lib/actions/settings";
import type { ReaderMode } from "@/lib/constants";

export interface SettingsFormValues {
  siteName: string;
  tagline: string;
  defaultReaderMode: ReaderMode;
  footerText: string;
  maintenanceMode: boolean;
  announcements: string; // newline-separated
}

export function SettingsForm({
  initialValues,
  readerModes,
}: {
  initialValues: SettingsFormValues;
  readerModes: ReaderMode[];
}) {
  const [pending, start] = React.useTransition();
  const [siteName, setSiteName] = React.useState(initialValues.siteName);
  const [tagline, setTagline] = React.useState(initialValues.tagline);
  const [defaultReaderMode, setDefaultReaderMode] = React.useState<ReaderMode>(initialValues.defaultReaderMode);
  const [footerText, setFooterText] = React.useState(initialValues.footerText);
  const [maintenanceMode, setMaintenanceMode] = React.useState(initialValues.maintenanceMode);
  const [announcements, setAnnouncements] = React.useState(initialValues.announcements);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateSettings({
        siteName,
        tagline,
        defaultReaderMode,
        footerText,
        maintenanceMode,
        announcements: announcements.split("\n"),
      });
      if (res.ok) toast.success("Settings saved");
      else toast.error(res.error ?? "Save failed");
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Site settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Default reader mode</Label>
            <Select value={defaultReaderMode} onValueChange={(v) => setDefaultReaderMode(v as ReaderMode)}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {readerModes.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="footer">Footer text</Label>
            <Textarea id="footer" value={footerText} onChange={(e) => setFooterText(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcements">Announcements (one per line)</Label>
            <Textarea id="announcements" value={announcements} onChange={(e) => setAnnouncements(e.target.value)} rows={4} />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="maint">Maintenance mode</Label>
              <p className="text-xs text-muted-foreground">Show a maintenance banner to public visitors.</p>
            </div>
            <Switch id="maint" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          <div>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default SettingsForm;
