"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Check, Loader2 } from "lucide-react";
import { useOrg } from "@/lib/context/OrgContext";
import { Button } from "@/components/ui/button";

const COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

function getShade(name: string) {
  if (!name) return COLORS[0];
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export function OrgSwitcher() {
  const { activeOrg, orgs, switchOrg, createOrg, loading } = useOrg();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Software");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowCreate(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (id: string) => {
    switchOrg(id);
    setOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    const ok = await createOrg(name, industry);
    setCreating(false);
    if (ok) {
      setShowCreate(false);
      setOpen(false);
      setName("");
    }
  };

  if (!activeOrg) {
    return (
      <div className="flex items-center gap-3 px-6 py-5">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Create Organisation
        </button>
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="flex items-center gap-3 px-6 py-5">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Create Organisation
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full border-b border-border/10" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-6 py-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-medium shadow-sm ${getShade(
            activeOrg.name
          )}`}
        >
          {activeOrg.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-medium tracking-tight text-foreground truncate">
            {activeOrg.name}
          </h1>
          <p className="text-[11px] text-muted-foreground truncate">
            {/* Hardcoding employees count for visual accuracy to spec. In reality, pull from context later */}
            Manage Payroll
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute top-full left-0 w-[260px] ml-4 mt-2 bg-card border border-border/40 shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[300px] overflow-y-auto py-2">
            {orgs.map((org) => (
              <div
                key={org._id}
                onClick={() => handleSwitch(org._id)}
                className="flex items-center gap-3 px-4 h-12 cursor-pointer hover:bg-indigo-500/10 transition-colors group"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-medium text-xs ${getShade(
                    org.name
                  )}`}
                >
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {org.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate opacity-80">
                    {org.walletAddress ? `Linked: ${org.walletAddress.substring(0,6)}...` : "Unlinked"}
                  </p>
                </div>
                {activeOrg._id === org._id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 p-2">
            <button
              onClick={() => {
                setOpen(false);
                setShowCreate(true);
              }}
              className="flex w-full items-center gap-2 px-2 py-2 text-[13px] font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add organisation
            </button>
          </div>
        </div>
      )}

      {/* CREATE ORG PANEL (SLIDE UP) */}
      <div
        ref={panelRef}
        className={`fixed bottom-0 left-0 w-64 bg-card border-t border-r border-border/40 shadow-2xl p-5 transition-transform duration-300 ease-out z-50 ${
          showCreate ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <h3 className="text-sm font-semibold mb-4">Create Organisation</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Company Name
            </label>
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
            {name && (
              <p className="text-[10px] text-muted-foreground pt-1">
                Org ID: {name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            >
              <option>Software</option>
              <option>Agency</option>
              <option>Crypto</option>
              <option>Retail</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
