"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "employer") {
        router.push("/employer/dashboard");
      } else if (session.user.role === "employee") {
        router.push("/employee/portal");
      } else {
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/login?returnUrl=/dashboard");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-b-2 border-indigo-500/30 animate-pulse" />
      </div>
      <p className="mt-8 text-sm font-medium text-slate-500 uppercase tracking-widest animate-pulse">
        Rerouting to Workspace
      </p>
    </div>
  );
}
