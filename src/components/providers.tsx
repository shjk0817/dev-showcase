"use client";

import { SessionProvider } from "next-auth/react";

/** NextAuth 会话上下文 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
