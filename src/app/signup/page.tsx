"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, UserCircle2, ArrowLeft, Loader2, Check, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"employer" | "employee" | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strength Check: length >= 8, uppercase, number, symbol
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score; // 0,1,2,3,4
  };

  const strength = getStrength();
  const pxPasswordsMatch = password && confirmPassword && password === confirmPassword;
  
  const canSubmit = pxPasswordsMatch && strength >= 2 && name.trim() && email.trim();

  const handleRoleSelect = (selected: "employer" | "employee") => {
    setRole(selected);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !role) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      
      if (!res.ok) {
        addToast(data.error || "Failed to create account", "error");
        setIsSubmitting(false);
        return;
      }

      addToast("Account generated successfully!", "success");

      // Auto sign-in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        rememberMe: "false"
      });

      if (signInRes?.ok) {
        if (role === "employer") router.push("/employer");
        if (role === "employee") router.push("/employee");
      } else {
        router.push("/login");
      }

    } catch (err) {
      addToast("Network execution error", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#6366f10a_1px,transparent_1px),linear-gradient(to_bottom,#6366f10a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="relative z-10 w-full max-w-2xl">
        
        {step === 1 && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h1 className="text-3xl font-bold text-foreground mb-3 text-center">Choose your account type</h1>
            <p className="text-muted-foreground text-center mb-10 max-w-md">Select whether you're provisioning assets outwards, or tracking an inbound payroll stream.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
              
              <button 
                onClick={() => handleRoleSelect("employer")}
                className="group relative bg-card border border-border/40 p-8 rounded-2xl flex flex-col items-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xl"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">I'm an employer</h2>
                <p className="text-[13px] text-muted-foreground">Pay your team on-chain with XLM securely with zero processing delays.</p>
              </button>

              <button 
                onClick={() => handleRoleSelect("employee")}
                className="group relative bg-card border border-border/40 p-8 rounded-2xl flex flex-col items-center text-center hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-xl"
              >
                <div className="h-16 w-16 rounded-full bg-cyan-400/10 flex items-center justify-center mb-5 group-hover:bg-cyan-400/20 transition-colors">
                  <UserCircle2 className="h-8 w-8 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">I'm an employee</h2>
                <p className="text-[13px] text-muted-foreground">Receive your salary on-chain natively and view digitally verified PDF Payslips.</p>
              </button>

            </div>
            
            <p className="mt-10 text-[14px] text-muted-foreground text-center">
              Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in securely</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-md mx-auto bg-card border border-border/20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-16 duration-500">
            <div className="p-8">
              
              <div className="flex items-center mb-8 pb-4 border-b border-border/20">
                <button 
                  onClick={() => setStep(1)} 
                  className="mr-4 p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${role === 'employer' ? 'bg-primary/20 text-primary' : 'bg-cyan-400/20 text-cyan-400'}`}>
                    {role === 'employer' ? 'Employer Hub' : 'Employee Access'}
                  </div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Create your account</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1 block pl-1">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Satoshi Nakamoto" className="bg-background/50 h-10 border-border/20 text-[14px]" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1 block pl-1">Email Node Address</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="hello@stellar.org" className="bg-background/50 h-10 border-border/20 text-[14px]" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1 block pl-1">Cryptographic Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••••••" className="bg-background/50 h-10 border-border/20 text-[14px]" />
                  
                  {/* Strength Meter */}
                  <div className="mt-2.5 flex items-center justify-between gap-1 w-full px-1">
                    {[1, 2, 3, 4].map((i) => {
                      let color = "bg-slate-800"; // default
                      if (i <= strength) {
                        if (strength === 1) color = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
                        if (strength === 2) color = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
                        if (strength === 3) color = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]";
                        if (strength === 4) color = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
                      }
                      return <div key={i} className={`h-1.5 w-1/4 rounded-full transition-all duration-300 ${color}`} />
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="text-[12px] font-medium text-muted-foreground mb-1 block pl-1">Confirm Identity Key</label>
                  <div className="relative">
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••••••" className={`bg-background/50 h-10 border-border/20 text-[14px] ${confirmPassword && !pxPasswordsMatch ? 'border-red-500/50 focus-visible:ring-red-500' : ''}`} />
                    {pxPasswordsMatch && (
                      <Check className="absolute right-3 top-2.5 h-4 w-4 text-emerald-500 animate-in zoom-in" />
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full h-11 text-[15px] font-medium shadow-xl transition-all ${
                       role === 'employer'
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-cyan-400/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Initialize Account
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
