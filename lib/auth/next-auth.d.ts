// Module augmentation for Auth.js v5 so the JWT + Session carry `role` and
// `active`. Without this, `token.role` / `session.user.role` are unknown to TS.
//
// `import type` is used everywhere so no runtime module is created.

import type { DefaultSession } from "next-auth";
import type { StaffRole } from "@/lib/constants";

declare module "next-auth" {
  /** Returned by `authorize()` and stored on the JWT via the jwt() callback. */
  interface User {
    role?: StaffRole;
    active?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: StaffRole;
      active: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: StaffRole;
    active?: boolean;
  }
}
