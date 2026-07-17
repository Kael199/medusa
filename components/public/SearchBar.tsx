"use client";

import { useState, useTransition, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  defaultValue?: string;
  onSubmitted?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  defaultValue = "",
  onSubmitted,
  className,
  autoFocus,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [, startTransition] = useTransition();

  // Keep input synced if URL changes (e.g. back/forward, page nav).
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

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
      className={"relative " + (className ?? "")}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search titles, authors…"
        aria-label="Search manga"
        autoFocus={autoFocus}
        className="reader-input pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setValue("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </form>
  );
}