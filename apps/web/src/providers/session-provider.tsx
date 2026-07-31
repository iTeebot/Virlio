"use client";

import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default SessionProviderWrapper;
