"use client";

import { useState, useTransition, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  defaultValue?: string;
  onSubmitted?: () => void;
  className?: string;
  autoFocus?: boolean;
}

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

export function SearchBar({
  defaultValue = "",
  onSubmitted,
  className,
  autoFocus,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [, startTransition] = useTransition();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // ⌘K / Ctrl+K to focus the search input
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    startTransition(() => {
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    });
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("group relative", className)}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-md transition-all duration-300",
          focused
            ? "opacity-100 shadow-[0_0_0_2px_hsl(var(--reader-cyan)/0.35),0_12px_36px_-12px_hsl(var(--reader-cyan)/0.45)]"
            : "opacity-0",
        )}
      />
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
          focused
            ? "text-[hsl(var(--reader-cyan))]"
            : "text-muted-foreground",
        )}
      />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search titles, authors…"
        aria-label="Search manga"
        autoFocus={autoFocus}
        className="reader-input h-9 rounded-md pl-9 pr-16 text-sm transition-colors"
      />
      {!value ? (
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--reader-muted))] sm:inline-flex"
        >
          {IS_MAC ? "⌘" : "Ctrl"} K
        </kbd>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-[hsl(var(--reader-muted))] hover:bg-white/10 hover:text-white"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </form>
  );
}
