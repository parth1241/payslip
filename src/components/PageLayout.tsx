"use client";

import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AmbientOrbs from "./AmbientOrbs";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1a] text-white overflow-x-hidden relative">
      <AmbientOrbs />
      <Navbar />
      <main className="flex-grow relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
