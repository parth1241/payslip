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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping opacity-20" />
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3">Are you still there?</h2>
          <p className="text-muted-foreground text-[14px] leading-relaxed mb-6">
            For your security, your session will automatically expire due to inactivity. 
            Please confirm you are still active.
          </p>

          <div className="w-full bg-background border border-border/40 rounded-xl p-4 mb-8 flex items-center justify-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-mono font-bold tracking-widest text-primary">{formattedTime}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="py-3 px-4 rounded-xl text-sm font-medium border border-border/40 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              Sign out now
            </button>
            <button
              onClick={() => {
                lastActivity.current = Date.now();
                setShowWarning(false);
                setCountdown(300);
              }}
              className="py-3 px-4 rounded-xl text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20 transition-all font-bold"
            >
              Keep me signed in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
