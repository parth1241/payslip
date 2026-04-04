"use client";

import { ToastProvider } from "@/contexts/ToastContext";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={300}>
      <ToastProvider>
        <OnboardingOverlay />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
