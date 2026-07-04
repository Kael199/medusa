// Shared Action result types for the lib/actions/* workstream. These match
// the Workstream B `asActionError` contract ({ ok:false, error, status? })
// so a thrown AuthError/ForbiddenError degrades to a plain error payload the
// client components can render via toast().

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

// Re-exported here so action files only need one import source.
export { asActionError } from "@/lib/auth/assert";
