"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ClientApprove({ 
  token, 
  requiresLogin, 
  orgName, 
  role 
}: { 
  token: string, 
  requiresLogin: boolean, 
  orgName: string, 
  role: string 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requiresLogin) {
      sessionStorage.setItem("ps_pending_invite", token);
      router.push(`/login?returnUrl=/invite/${token}`);
    }
  }, [requiresLogin, router, token]);

  if (requiresLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      if (res.ok) {
        // Clear cache
        sessionStorage.removeItem("ps_pending_invite");
        alert(`Welcome to ${orgName}! You joined as ${role}.`);
        router.push("/employer");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to accept invite.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-card border border-border/40 p-8 rounded-2xl shadow-2xl text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-primary/10 flex items-center justify-center rounded-xl shadow-inner border border-primary/20">
          <span className="text-2xl font-bold text-primary">{orgName.charAt(0).toUpperCase()}</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">You've been invited!</h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed px-4">
            You have been invited to join <strong className="text-foreground">{orgName}</strong> as an <strong className="text-foreground capitalize">{role}</strong>.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
            {error}
          </div>
        )}

        <Button 
          onClick={handleAccept} 
          disabled={loading} 
          className="w-full h-12 text-[15px] bg-primary hover:bg-primary/90 text-white shadow-lg"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Accept Invitation"}
        </Button>
      </div>
    </div>
  );
}
