"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import React from "react";
import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
  session?: Session | null; // Use the Session type here
}

export default function SessionProviderWrapper({ children, session }: Props) {
  return <SessionProvider session={session}>
    <Suspense fallback={null}>
      {children}
    </Suspense>
  </SessionProvider>;
}

