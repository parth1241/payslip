"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionWatcher } from "@/components/SessionWatcher";
import WalletStatusBar from "@/components/shared/WalletStatusBar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
       <div className="min-h-screen bg-background flex flex-col">
        <div className="h-20 border-b border-border/20 bg-card/50 flex items-center px-8 justify-between">
           <div className="h-8 bg-white/5 rounded-lg w-48 animate-pulse" />
           <div className="h-10 bg-white/5 rounded-lg w-32 animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin opacity-50" />
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "employee") {
    redirect("/login");
    return null;
  }

  return (
    <>
      <SessionWatcher />
      <WalletStatusBar />
      {children}
    </>
  );
}
