"use client";

import { useEffect } from "react";
import { RefreshCcw, Home, ShieldAlert, Terminal } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8 animate-pulse shadow-[0_0_50px_rgba(244,63,94,0.1)]">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
        The application encountered an unexpected runtime exception. Our engineers have been notified.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="w-full max-w-xl bg-black/40 border border-white/10 rounded-xl p-4 mb-10 text-left overflow-auto max-h-48 group">
          <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
            <Terminal className="h-3 w-3" />
            Stack Trace
          </div>
          <pre className="text-[12px] font-mono text-rose-300/80 whitespace-pre-wrap">
            {error.message}
            {error.stack}
          </pre>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto btn-primary h-12 px-8 font-bold gap-2 text-[14px] bg-gradient-to-r from-rose-600 to-rose-500 hover:shadow-rose-500/25"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link 
          href="/" 
          className="w-full sm:w-auto btn-secondary h-12 px-8 font-bold gap-2 text-[14px]"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
