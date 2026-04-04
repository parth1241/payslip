"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Clock } from "lucide-react";

export function SessionWatcher() {
  const lastActivity = useRef<number>(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Activity Tracker
  useEffect(() => {
    const handleActivity = () => {
      lastActivity.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Check for inactivity every 60 seconds
    const intervalId = setInterval(() => {
      const now = Date.now();
      // 60 minutes = 3600000 ms
      if (now - lastActivity.current > 3600000 && !showWarning) {
        setShowWarning(true);
        setCountdown(300);
      }
    }, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(intervalId);
    };
  }, [showWarning]);

  // Countdown logic for the warning modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showWarning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showWarning && countdown <= 0) {
      signOut({ callbackUrl: "/login" });
    }

    return () => clearInterval(timer);
  }, [showWarning, countdown]);

  if (!showWarning) return null;

  const formattedTime = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 z-[100] min-h-screen flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-[440px] bg-card border border-amber-500/20 rounded-3xl shadow-[0_0_100px_rgba(245,158,11,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Subtle top amber bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />
        
        <div className="p-10 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-8 shadow-inner relative group">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping opacity-20" />
            <AlertTriangle className="h-10 w-10 text-amber-500 transition-transform group-hover:scale-110 duration-300" />
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Session Timing Out</h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">
            For your security, your session will automatically expire due to inactivity. 
            Confirm your presence to maintain your secure connection.
          </p>

          <div className="w-full bg-surface/50 border border-border/40 rounded-2xl p-5 mb-10 flex items-center justify-center gap-4 group transition-colors hover:border-amber-500/30">
            <Clock className="h-6 w-6 text-amber-500/70 animate-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-3xl font-mono font-black tracking-[0.2em] text-primary tabular-nums">
                {formattedTime}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-1">Automatic Logout</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                lastActivity.current = Date.now();
                setShowWarning(false);
                setCountdown(300);
              }}
              className="w-full py-4 px-6 rounded-2xl text-[15px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Extend Session
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full py-4 px-6 rounded-2xl text-[14px] font-semibold border border-border/40 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              Sign out now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
