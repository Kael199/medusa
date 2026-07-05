"use client";

// Client sign-up form. Submits to the `registerStaff` Server Action, then on
// success calls Auth.js `signIn("credentials", ...)` to establish a session
// and navigates to /admin. Sonner handles inline error/success feedback.

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
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { registerStaff } from "@/lib/actions/register";

interface SignupFormProps {
  /** Pre-resolved by the server so the client doesn't call useSearchParams on a static page. */
  registrationOpen: boolean;
}

export function SignupForm({ registrationOpen }: SignupFormProps) {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [inviteCode, setInviteCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !registrationOpen) return;

    setSubmitting(true);
    try {
      const result = await registerStaff({ name, email, password, inviteCode });
      if (!result.ok) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }

      // Account is created — sign in immediately. Same user-enumeration hedge
      // as the login form: a single call, generic outcomes.
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (!signInRes || signInRes.error) {
        toast.success("Account created. Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to Mango");
      router.push(signInRes.url ?? "/admin");
      router.refresh();
    } catch {
      toast.error("Sign-up failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {!registrationOpen && (
            <div
              role="status"
              className="rounded-md border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
            >
              Self-registration is currently disabled. Ask an admin to create
              your account or to issue an invite code.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              disabled={submitting || !registrationOpen}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              disabled={submitting || !registrationOpen}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mango.app"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                disabled={submitting || !registrationOpen}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite code</Label>
            <Input
              id="inviteCode"
              name="inviteCode"
              type="text"
              autoComplete="off"
              required
              value={inviteCode}
              disabled={submitting || !registrationOpen}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Code from an admin"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !registrationOpen}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}