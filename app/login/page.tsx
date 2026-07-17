// /login — Server Component. If already authenticated, bounce to /admin.
// Otherwise render the client login form. We read the `callbackPath` search
// param here and pass it down so a successful sign-in returns the user where
// they were trying to go.

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { LoginForm } from "@/app/login/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const raw = sp.callbackPath;
  const callbackPath = typeof raw === "string" ? raw : undefined;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/12),transparent_60%),radial-gradient(ellipse_at_bottom_right,theme(colors.accent/60),transparent_55%)]"
      />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Medusa Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to the staff console.
          </p>
        </div>
        <LoginForm callbackPath={callbackPath} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <a
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
