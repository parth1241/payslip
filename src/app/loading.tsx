"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a1a] flex flex-col items-center justify-center">
      <div className="relative mb-10">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 animate-pulse blur-xl opacity-50 absolute inset-0"></div>
        <div className="relative h-16 w-16 rounded-3xl border border-white/20 flex items-center justify-center bg-card/40 backdrop-blur-md">
          <span className="text-white font-black text-2xl tracking-tighter">P</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-black gradient-text tracking-tight animate-pulse">
          PaySlip
        </h2>
        <div className="flex gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
