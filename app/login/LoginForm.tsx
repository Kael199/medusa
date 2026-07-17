"use client";

// Client login form. Calls Auth.js `signIn("credentials", ...)` with
// `redirect:false` so we can render inline errors via Sonner and then
// `router.push()` to the callbackPath (or /admin) on success.

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

interface LoginFormProps {
  /** Pre-resolved callbackPath from the server so the client doesn't need useSearchParams on the login page itself. */
  callbackPath?: string;
}

export function LoginForm({ callbackPath }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // The server component (login/page.tsx) already resolved callbackPath from
  // search params, so we don't call useSearchParams() here — that would force
  // a Suspense boundary on the statically-renderable login page in Next 16.
  const resolveCallbackUrl = React.useCallback(
    () => callbackPath ?? "/admin",
    [callbackPath],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const callbackUrl = resolveCallbackUrl();
    setSubmitting(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) {
        // Generic message — don't leak "no such user" vs "wrong password".
        toast.error("Invalid credentials");
        setSubmitting(false);
        return;
      }

      // Success: navigate to the callback URL.
      toast.success("Signed in");
      router.push(res.url ?? callbackUrl);
      router.refresh();
    } catch (err) {
      toast.error("Sign-in failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sign in</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              disabled={submitting}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@medusa.app"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                disabled={submitting}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
