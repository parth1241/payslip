"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionWatcher } from "@/components/SessionWatcher";
import { OrgProvider } from "@/lib/context/OrgContext";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    // Elegant no-flash skeleton structural fallback
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="hidden lg:flex w-64 flex-col bg-card border-r border-border/20 p-6">
          <div className="h-10 bg-white/5 rounded-lg mb-10 w-2/3 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="mt-auto h-16 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-20 border-b border-border/20 bg-card/50 flex items-center px-8">
             <div className="h-8 bg-white/5 rounded-lg w-48 animate-pulse" />
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "employer") {
    redirect("/login");
    return null;
  }

  return (
    <OrgProvider>
      <SessionWatcher />
      {children}
    </OrgProvider>
  );
}
