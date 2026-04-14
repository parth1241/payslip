import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastMessage } from "@/contexts/ToastContext";
import { useEffect, useState } from "react";

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fading out slightly before actual dismissal
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 3600);
    return () => clearTimeout(fadeTimer);
  }, []);

  const config = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-cyan-400" />,
      border: "border-l-cyan-500",
      bg: "bg-cyan-500/10",
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      border: "border-l-red-500",
      bg: "bg-red-500/10",
    },
    info: {
      icon: <Info className="h-5 w-5 text-indigo-400" />,
      border: "border-l-indigo-500",
      bg: "bg-indigo-500/10",
    },
  }[toast.type];

  return (
    <div
      className={`relative flex items-center justify-between w-80 bg-card rounded-lg border border-border/40 border-l-4 ${
        config.border
      } p-4 shadow-xl transition-all duration-300 ${
        fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } animate-in slide-in-from-right-4 fade-in`}
    >
      <div className="flex flex-row items-center gap-3">
        <div className={`p-1.5 rounded-full ${config.bg}`}>{config.icon}</div>
        <p className="text-[13px] font-medium text-foreground pr-4 leading-tight">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => {
          setFading(true);
          setTimeout(onDismiss, 300);
        }}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
