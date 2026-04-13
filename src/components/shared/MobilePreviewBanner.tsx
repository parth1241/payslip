"use client";

import React from "react";

// Remove this component after taking screenshots
// Only for submission screenshot documentation
export function MobilePreviewBanner() {
  return (
    <div className="fixed bottom-4 left-4 z-50 
                    bg-surface border border-subtle 
                    rounded-lg px-3 py-2 text-xs
                    text-secondary md:hidden shadow-xl
                    animate-bounce">
      📱 Mobile View — 375px
    </div>
  );
}
