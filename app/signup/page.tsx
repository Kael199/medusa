// /signup — Server Component. If already authenticated, bounce to /admin.
// Otherwise render the client registration form. Self-service sign-up is
// gated by a server-side STAFF_INVITE_CODE (see lib/actions/register.ts).

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { SignupForm } from "@/app/signup/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  const registrationOpen = Boolean(process.env.STAFF_INVITE_CODE);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      {/* Soft brand backdrop — uses theme tokens (primary + accent) so it
          adapts to light/dark without per-mode overrides. pointer-events-none
          keeps it out of the tab order. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/12),transparent_60%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent/60),transparent_55%)]"
      />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your Mango account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff sign-up. You&apos;ll need an invite code from an admin.
          </p>
        </div>
        <SignupForm registrationOpen={registrationOpen} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}