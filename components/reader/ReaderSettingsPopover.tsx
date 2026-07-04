"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import type { ReaderMode } from "@/lib/constants";

export type WidthMode = "fit" | "actual";

interface ReaderSettingsPopoverProps {
  mode: ReaderMode;
  widthMode: WidthMode;
  webtoonGap: number;
  onModeChange: (mode: ReaderMode) => void;
  onWidthModeChange: (w: WidthMode) => void;
  onWebtoonGapChange: (gap: number) => void;
}

export function ReaderSettingsPopover({
  mode,
  widthMode,
  webtoonGap,
  onModeChange,
  onWidthModeChange,
  onWebtoonGapChange,
}: ReaderSettingsPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Reader settings"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      {open && (
        <>
          {/* click-away catcher */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-64 rounded-md border bg-popover p-4 shadow-md">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Reading mode</label>
                <Select
                  value={mode}
                  onValueChange={(v) => { onModeChange(v as ReaderMode); }}
                >
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paginated">Paginated</SelectItem>
                    <SelectItem value="list">List (all pages)</SelectItem>
                    <SelectItem value="webtoon">Webtoon (continuous)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Image width</label>
                <Select
                  value={widthMode}
                  onValueChange={(v) => onWidthModeChange(v as WidthMode)}
                >
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit to width</SelectItem>
                    <SelectItem value="actual">Actual size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === "webtoon" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Webtoon gap: {webtoonGap}px
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    step={2}
                    value={webtoonGap}
                    onChange={(e) => onWebtoonGapChange(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                Shortcuts: ← / → or Space = page, <kbd>m</kbd> = mode, <kbd>f</kbd> = fullscreen
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
