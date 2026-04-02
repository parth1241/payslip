"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface Org {
  _id: string;
  name: string;
  slug: string;
  industry?: string;
  walletAddress?: string;
  settings: {
    currency: string;
    paySchedule: "weekly" | "biweekly" | "monthly";
  };
}

interface OrgContextType {
  activeOrg: Org | null;
  orgs: Org[];
  switchOrg: (orgId: string) => void;
  createOrg: (name: string, industry?: string) => Promise<boolean>;
  loading: boolean;
  transitioning: boolean;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [orgs, setOrgs] = useState<Org[]>([]);
  
  // Synchronous read to eliminate UI flash on hard reload
  const initialOrgId = typeof window !== 'undefined' ? localStorage.getItem("ps_active_org") : null;
  const [activeOrg, setActiveOrg] = useState<Org | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (status === "loading" || !session?.user) {
      if (status === "unauthenticated") setLoading(false);
      return;
    }

    const fetchOrgs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orgs");
        if (res.ok) {
          const fetchedOrgs = await res.json();
          setOrgs(fetchedOrgs);

          if (fetchedOrgs.length > 0) {
            const cachedId = localStorage.getItem("ps_active_org");
            const match = fetchedOrgs.find((o: Org) => o._id === cachedId);
            if (match) {
              setActiveOrg(match);
            } else {
              setActiveOrg(fetchedOrgs[0]);
              localStorage.setItem("ps_active_org", fetchedOrgs[0]._id);
            }
          } else {
            setActiveOrg(null);
          }
        }
      } catch (err) {
        console.error("Failed to load orgs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [session, status]);

  const switchOrg = (orgId: string) => {
    const target = orgs.find((o) => o._id === orgId);
    if (target && target._id !== activeOrg?._id) {
      setTransitioning(true);
      setTimeout(() => {
        setActiveOrg(target);
        localStorage.setItem("ps_active_org", target._id);
        setTimeout(() => setTransitioning(false), 200);
      }, 150);
    }
  };

  const createOrg = async (name: string, industry?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry }),
      });
      if (res.ok) {
        const data = await res.json();
        const newOrg = data.org;
        setOrgs((prev) => [...prev, newOrg]);
        switchOrg(newOrg._id);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <OrgContext.Provider value={{ activeOrg, orgs, switchOrg, createOrg, loading, transitioning }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
