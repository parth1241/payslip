"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrg } from "@/lib/context/OrgContext";
import Image from "next/image";
import {
  Users,
  CalendarClock,
  Coins,
  Plus,
  Pencil,
  Trash2,
  Rocket,
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  ChevronDown,
  Loader2,
  Activity,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useCurrencyStore } from "@/store/currencyStore";
import { fetchXLMHistory } from "@/lib/price";
import { bulkDisburse, connectWallet, getWalletBalance } from "@/lib/stellar";
import { requestAccess } from "@stellar/freighter-api";
import { PayrollTracker } from "@/components/PayrollTracker";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { WalletButton } from "@/components/WalletButton";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─────────────────────────────────────────────
 *  Types
 * ───────────────────────────────────────────── */
interface Employee {
  id: string;
  name: string;
  walletAddress: string;
  salary: number;
  status: "active" | "pending" | "inactive";
  lastPaid?: string;
}

/* ─────────────────────────────────────────────
 *  Seed data
 * ───────────────────────────────────────────── */
const SEED_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    walletAddress: "GBXK7YO3QFUTSGJKR4EGNZP7IZHSSG2DZCPFYXCLMWGRHZWZQNBEFIT",
    salary: 1200,
    status: "active",
    lastPaid: "Mar 15, 2026",
  },
  {
    id: "2",
    name: "Maya Patel",
    walletAddress: "GDJL4ZN3P2RAQWALM6KBHCJDH7A3RPUF3TR5JKWZLC7EW5V3P74DLXR",
    salary: 950,
    status: "active",
    lastPaid: "Mar 15, 2026",
  },
  {
    id: "3",
    name: "Rohan Desai",
    walletAddress: "GCIFMEYBLR2KKQEX4NYWMFHS7GJV6MZTT3DHBXMRC4AEWFG7LNBPLRTJ",
    salary: 1500,
    status: "pending",
  },
  {
    id: "4",
    name: "Priya Nair",
    walletAddress: "GA7V2XNBWKV7Q3CZHSKD6PJMFVF5LNHPR2YWD3IJGCXZBVM4SRLEFRA",
    salary: 800,
    status: "inactive",
    lastPaid: "Jan 15, 2026",
  },
];

const MOCK_CHART_DATA = [
  { name: "Oct", value: 4200, lastMonth: 3800 },
  { name: "Nov", value: 3800, lastMonth: 4100 },
  { name: "Dec", value: 5000, lastMonth: 4200 },
  { name: "Jan", value: 4800, lastMonth: 5000 },
  { name: "Feb", value: 5200, lastMonth: 4800 },
  { name: "Mar", value: 4450, lastMonth: 5200 },
];

/* ─────────────────────────────────────────────
 *  Helpers
 * ───────────────────────────────────────────── */
function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatXLM(amount: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const statusConfig: Record<
  Employee["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  inactive: {
    label: "Inactive",
    className: "bg-slate-400/15 text-slate-400 border-slate-400/25",
  },
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Employees", active: false },
  { icon: FileText, label: "Payroll History", active: false },
  { icon: Wallet, label: "Wallet", active: false },
  { icon: Settings, label: "Settings", active: false },
];

/* ─────────────────────────────────────────────
 *  CountUp Animation Hook
 * ───────────────────────────────────────────── */
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function useCountUp(end: number, duration: number = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1);
      
      setValue(easeOutExpo(t) * end);

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return value;
}

/* ═════════════════════════════════════════════
 *  Component
 * ═════════════════════════════════════════════ */
export default function EmployerDashboard() {
  const { data: session, update } = useSession();
  const { currency, xlmUsdRate, refreshRate } = useCurrencyStore();
  const { activeOrg, orgs, switchOrg, createOrg, loading: orgLoading, transitioning } = useOrg();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Wallet Persistence State
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);
  const [linking, setLinking] = useState(false);

  // Mismatch Detection & Balance Reload
  useEffect(() => {
    async function checkWallet() {
      try {
        const pk = await requestAccess().then(r => r.address);
        const userWallet = (session?.user as any)?.linkedWallet;
        const orgWallet = activeOrg?.walletAddress;

        if (userWallet && pk !== userWallet) {
          setShowMismatch(true);
        } else {
          setShowMismatch(false);
        }

        if (pk) {
          const bal = await getWalletBalance(pk);
          setBalance(bal);
        }
      } catch (err) {}
    }
    if (session && activeOrg) {
      checkWallet();
    }
  }, [session, activeOrg]);

  const refreshBalance = async () => {
    setBalanceLoading(true);
    try {
      const pk = await requestAccess().then(r => r.address);
      const bal = await getWalletBalance(pk);
      setBalance(bal);
    } catch (err) {}
    setTimeout(() => setBalanceLoading(false), 800);
  };

  const handleLinkWallet = async () => {
    setLinking(true);
    try {
      const address = await connectWallet();
      if (!address || !address.startsWith("G") || address.length !== 56) {
        throw new Error("Invalid format");
      }
      
      const res = await fetch("/api/user/link-wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, orgId: activeOrg?._id })
      });
      if (res.ok) {
        await update({ linkedWallet: address }); 
        setShowMismatch(false);
        refreshBalance();
      }
    } catch (err) {}
    setLinking(false);
  };

  useEffect(() => {
    if (!activeOrg) return;
    const fetchEmps = async () => {
      try {
        const res = await fetch(`/api/employees?orgId=${activeOrg._id}`);
        if (res.ok) {
          const data = await res.json();
          setEmployees(
            data.map((d: any) => ({
              id: d._id,
              name: d.name,
              walletAddress: d.walletAddress,
              salary: d.salary,
              status: d.status,
            }))
          );
        }
      } catch (err) {
        console.error("Failed fetching employees:", err);
      }
    };
    fetchEmps();
  }, [activeOrg]);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; dir: "asc" | "desc" } | null>(null);

  // Price Chart State
  const [priceOpen, setPriceOpen] = useState(false);
  const [chartData, setChartData] = useState<{timestamp: number; price: number}[]>([]);

  useEffect(() => {
    fetchXLMHistory().then(setChartData);
    
    // Refresh the live rate every 30s
    const rateInterval = setInterval(refreshRate, 30000);
    return () => clearInterval(rateInterval);
  }, [refreshRate]);

  // Employee Dialog Add/Edit State
  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWallet, setFormWallet] = useState("");
  const [formSalary, setFormSalary] = useState("");

  // Payroll Modal State
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [payrollStep, setPayrollStep] = useState<"preview" | "processing" | "success">("preview");
  const [payrollProgress, setPayrollProgress] = useState(0);
  const [publishedTxHash, setPublishedTxHash] = useState<string | null>(null);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  // Chart Toggle
  const [chartView, setChartView] = useState<"current" | "previous">("current");

  // Live Timer
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const int = setInterval(() => setTime(new Date()), 60000); // update every minute
    return () => clearInterval(int);
  }, []);

  /* ── Derived stats ── */
  const totalEmployees = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status !== "inactive").length;
  const totalDisbursed = employees
    .filter((e) => e.status !== "inactive")
    .reduce((s, e) => s + e.salary, 0);

  // Animated numbers for UI
  const animDisbursed = useCountUp(totalDisbursed, 1500);
  const animEmployees = useCountUp(totalEmployees, 1500);
  const animSuccessRate = useCountUp(99.9, 2000);

  /* ── Table Processing ── */
  const processedEmployees = useMemo(() => {
    let result = [...employees];
    
    // 1. Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.walletAddress.toLowerCase().includes(q)
      );
    }
    
    // 2. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [employees, searchQuery, sortConfig]);

  const handleSort = (key: keyof Employee) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  /* ── Actions ── */
  function openAddDialog() {
    setFormName("");
    setFormWallet("");
    setFormSalary("");
    setEditingEmployee(null);
    setEmpDialogOpen(true);
  }

  function openEditDialog(emp: Employee) {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormWallet(emp.walletAddress);
    setFormSalary(String(emp.salary));
    setEmpDialogOpen(true);
  }

  async function handleSaveEmployee() {
    if (!formName || !formWallet || !formSalary || !activeOrg) return;

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id
            ? { ...e, name: formName, walletAddress: formWallet, salary: Number(formSalary) }
            : e
        )
      );
    } else {
      try {
        const isInvite = !!formEmail;
        const endpoint = isInvite ? "/api/employees/invite" : "/api/employees";
        const body = { 
           name: formName, 
           walletAddress: formWallet, 
           salary: Number(formSalary), 
           orgId: activeOrg._id,
           ...(isInvite && { email: formEmail })
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (res.ok) {
           const data = await res.json();
           setEmployees((prev) => [...prev, {
             id: data.employee._id,
             name: formName,
             walletAddress: formWallet,
             salary: Number(formSalary),
             status: isInvite ? "pending" : "active",
           }]);
           // Automatically trigger dashboard layout animation blocks explicitly mapping
           if (isInvite) alert("Invite Generated! Sequence output via Local Terminal Console mapping.");
        }
      } catch (err) {
        console.error("Employee sync error", err);
      }
    }
    setEmpDialogOpen(false);
  }

  function handleDeleteEmployee(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  /* ── Payroll Flow ── */
  const activeEmps = employees.filter(e => e.status !== "inactive");
  const estimatedFee = activeEmps.length * 0.00001;

  async function payrollExecutor() {
    const entries = activeEmps.map((emp) => ({
      destination: emp.walletAddress,
      amount: String(emp.salary),
      employeeName: emp.name,
    }));
    const results = await bulkDisburse(entries, currency);
    const successResult = results.find((r) => r.success);
    if (!successResult) {
      throw new Error(results[0]?.error || "Transaction failed");
    }
    return successResult.txHash;
  }

  function startPayrollTracker() {
    setPayrollError(null);
    setPayrollStep("processing");
  }

  function finishPayrollTracker() {
    setEmployees((prev) =>
      prev.map((e) =>
        e.status === "pending"
          ? { ...e, status: "active", lastPaid: new Date().toLocaleDateString() }
          : { ...e, lastPaid: new Date().toLocaleDateString() }
      )
    );
    setPayrollModalOpen(false);
  }

  /* ═══════════════════════════════════════════
   *  Render
   * ═══════════════════════════════════════════ */
  const lastLoginText = session?.user?.lastLogin
    ? formatDistanceToNow(new Date((session.user as any).lastLogin), { addSuffix: true })
    : 'First login';
    
  const userWallet = (session?.user as any)?.linkedWallet;
  const isMissingWallet = !userWallet || !activeOrg?.walletAddress;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* --- Sidebar --- */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border/20 text-foreground transition-all duration-300 relative z-20">
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-primary/30 to-transparent" />
        
        {/* Org Switcher Component replaces Logo block */}
        <OrgSwitcher />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border/10 px-4 py-4 bg-background/30 w-full flex flex-col align-center">
          <WalletButton />
          <div className="mt-3 text-center text-[10px] text-muted-foreground font-mono">
            Last login: {lastLoginText}
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className={`flex-1 overflow-y-auto relative z-10 w-full flex flex-col transition-all duration-150 ease-in-out ${
          transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Header bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/20 bg-background/80 backdrop-blur-xl px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            
            {/* Status Badges */}
            <div className="hidden sm:flex items-center gap-4">
              <CurrencyToggle />
              
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">Stellar Testnet</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 relative">
            {/* Wallet Balance Widget */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full">
               <Wallet className="h-3 w-3 text-primary" />
               <span className="text-[12px] font-medium text-white font-mono tracking-tight">
                 {balance === null ? <span title="Install Freighter to configure bounds">—</span> : `${balance} XLM`}
               </span>
               <button onClick={refreshBalance} disabled={balanceLoading}>
                  <RefreshCw className={`h-[10px] w-[10px] text-muted-foreground transition-transform ${balanceLoading ? "animate-spin text-primary" : "hover:text-foreground"}`} />
               </button>
            </div>
            {/* Price Badge Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setPriceOpen(!priceOpen)} 
                className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-full transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[12px] font-bold text-white font-mono">XLM ${xlmUsdRate.toFixed(4)}</span>
              </button>
              
              {priceOpen && (
                 <div className="absolute top-10 right-0 w-64 bg-card border border-border/40 shadow-xl rounded-xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/20">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">7-Day XLM/USD</p>
                      <Activity className="h-3 w-3 text-cyan-400" />
                    </div>
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <Area type="monotone" dataKey="price" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                          <YAxis domain={['auto', 'auto']} hide />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              )}
            </div>

            {time && (
              <span className="hidden md:block text-[12px] font-medium text-muted-foreground font-mono">
                {time.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })} • {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
            
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </button>

            {/* Preflight Payroll Trigger */}
            <Button
              onClick={() => setPayrollModalOpen(true)}
              className="gap-2 text-[13px] bg-primary hover:bg-indigo-400 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
            >
              <Rocket className="h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </header>

        {/* --- PERSISTENT BANNERS --- */}
        {isMissingWallet && !showMismatch && (
          <div className="mx-6 lg:mx-8 mt-6 bg-indigo-500/10 border-l-[3px] border-indigo-500 rounded-r-lg p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Wallet className="h-[18px] w-[18px] text-indigo-400" />
              <p className="text-[13px] font-medium text-indigo-100/90">Link your Stellar wallet to enable payroll disbursement for <strong className="text-white">{activeOrg?.name}</strong>.</p>
            </div>
            <Button onClick={handleLinkWallet} disabled={linking} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-[12px]">
              {linking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Link wallet"}
            </Button>
          </div>
        )}

        {showMismatch && (
          <div className="mx-6 lg:mx-8 mt-6 bg-yellow-500/10 border-l-[3px] border-yellow-500 rounded-r-lg p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-[18px] w-[18px] text-yellow-500" />
              <p className="text-[13px] font-medium text-yellow-100/90">Your Freighter wallet changed. Re-link to continue running payroll properly.</p>
            </div>
            <Button onClick={handleLinkWallet} disabled={linking} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold border-none h-8 text-[12px]">
               {linking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Re-link"}
            </Button>
          </div>
        )}

        {/* Content Body */}
        <div className="px-6 lg:px-8 py-6 space-y-6 flex-1">
          {/* 1. Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="relative overflow-hidden bg-card border-l-[3px] border-l-primary/60 border-t-0 border-r-0 border-b-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 bg-card">
                <CardTitle className="text-[13px] font-semibold text-muted-foreground">Total Employees</CardTitle>
                <Users className="h-[18px] w-[18px] text-primary" />
              </CardHeader>
              <CardContent className="bg-card">
                <p className="text-2xl font-bold text-foreground font-mono">{animEmployees.toFixed(0)}</p>
                <p className="text-[11px] font-medium text-emerald-400 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> 12% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-card border-l-[3px] border-l-cyan-400/60 border-t-0 border-r-0 border-b-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-semibold text-muted-foreground">Next Payroll</CardTitle>
                <CalendarClock className="h-[18px] w-[18px] text-cyan-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground font-mono">14 <span className="text-sm font-sans text-muted-foreground">days</span></p>
                <p className="text-[11px] font-medium text-muted-foreground mt-2">Expected April 15, 2026</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-card border-l-[3px] border-l-violet-400/60 border-t-0 border-r-0 border-b-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-semibold text-muted-foreground">Total Disbursed</CardTitle>
                <Coins className="h-[18px] w-[18px] text-violet-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {formatXLM(animDisbursed)} <span className="text-sm font-sans text-muted-foreground">XLM</span>
                </p>
                <p className="text-[11px] font-medium text-emerald-400 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> 4.2% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-card border-l-[3px] border-l-emerald-400/60 border-t-0 border-r-0 border-b-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-[13px] font-semibold text-muted-foreground">Success Rate</CardTitle>
                <Activity className="h-[18px] w-[18px] text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground font-mono">{animSuccessRate.toFixed(1)}<span className="text-sm">%</span></p>
                <p className="text-[11px] font-medium text-muted-foreground mt-2">Zero network rejections</p>
              </CardContent>
            </Card>
          </div>

          {/* 2. Chart Section */}
          <Card className="bg-card border-border/20 shadow-xl overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Disbursement History</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">XLM volume sent over recent months.</p>
              </div>
              <div className="flex bg-background rounded-lg p-1 border border-border/20 shadow-inner">
                <button 
                  onClick={() => setChartView("current")}
                  className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors ${chartView === "current" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  This Year
                </button>
                <button 
                  onClick={() => setChartView("previous")}
                  className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors ${chartView === "previous" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Last Year
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-2 pl-0">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace'}}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(99,102,241,0.2)', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                      itemStyle={{ color: '#f1f5f9', fontWeight: 600, fontFamily: 'monospace' }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey={chartView === "current" ? "value" : "lastMonth"} 
                      stroke="#22d3ee" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. DataTable */}
          <Card className="bg-card border-border/20 shadow-xl overflow-visible">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    Team Directory
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-0 rounded-full px-2 py-0.5 text-[10px]">{activeEmployeesCount} Active</Badge>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search name or wallet..."
                    className="w-[240px] h-9 text-[13px] border-border/20 bg-background focus-visible:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    className="h-9 gap-1.5 text-[12px] font-semibold"
                    variant="outline"
                    onClick={openAddDialog}
                  >
                    <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="w-[250px] cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('name')}>
                      Employee Name {sortConfig?.key === 'name' && (sortConfig.dir === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('salary')}>
                      Monthly Salary {sortConfig?.key === 'salary' && (sortConfig.dir === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('status')}>
                      Status {sortConfig?.key === 'status' && (sortConfig.dir === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Last Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedEmployees.length > 0 ? processedEmployees.map((emp) => {
                    const status = statusConfig[emp.status];
                    return (
                      <TableRow
                        key={emp.id}
                        className="group border-border/10 hover:bg-primary/5 transition-colors border-l-4 border-l-transparent hover:border-l-primary cursor-pointer"
                      >
                        <TableCell className="font-medium text-foreground py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border/30 text-[12px] font-bold text-foreground shadow-sm group-hover:border-primary/50 transition-colors">
                              {emp.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-[13.5px]">{emp.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded-md bg-background px-2 py-1 text-[12px] font-mono text-muted-foreground border border-border/10 group-hover:text-primary/80 transition-colors">
                            {truncateAddress(emp.walletAddress)}
                          </code>
                        </TableCell>
                        <TableCell className="text-[13.5px] font-semibold text-foreground font-mono">
                          {formatXLM(emp.salary)}{" "}
                          <span className="text-[11px] font-normal text-muted-foreground font-sans">XLM</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] font-semibold border ${status.className}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[12.5px] text-muted-foreground">
                          {emp.lastPaid || <span className="text-slate-500 italic">Never</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); openEditDialog(emp); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No employees found. Adjust search or add a new team member.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ---------------------------------------------
       *  ADD/EDIT EMPLOYEE DIALOG
       * --------------------------------------------- */}
      <Dialog open={empDialogOpen} onOpenChange={setEmpDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-border/20 bg-card text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Team Member"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define the employee's public Stellar wallet and monthly XLM salary.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} className="bg-background border-border/20" />
            </div>
            <div className="grid gap-2">
              <Label>Employee Email (Optional)</Label>
              <Input placeholder="e.g. employee@company.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" className="bg-background border-border/20" />
            </div>
            <div className="grid gap-2">
              <Label>Wallet Address</Label>
              <Input placeholder="G..." value={formWallet} onChange={(e) => setFormWallet(e.target.value)} className="font-mono bg-background border-border/20 text-[13px]" />
            </div>
            <div className="grid gap-2">
              <Label>Monthly Salary ({currency})</Label>
              <div className="relative">
                <Input type="number" placeholder="e.g. 500" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} className={`font-mono bg-background border-border/20 text-[13px] ${currency === 'XLM' ? 'pr-28' : ''}`} />
                {currency === 'XLM' && (
                  <div className="absolute right-3 top-2.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    ≈ ${(Number(formSalary || 0) * xlmUsdRate).toFixed(2)} 
                    <Activity title="Refresh Price" className="h-3 w-3 cursor-pointer hover:text-cyan-400 transition-colors" onClick={refreshRate} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpDialogOpen(false)} className="border-border/20 bg-transparent text-foreground hover:bg-background">Cancel</Button>
            <Button onClick={handleSaveEmployee} className="bg-primary hover:bg-indigo-400 text-white shadow-lg shadow-primary/20">{editingEmployee ? "Save Changes" : "Add Employee"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------
       *  MULTI-STEP PAYROLL MODAL
       * --------------------------------------------- */}
      <Dialog open={payrollModalOpen} onOpenChange={(open) => {
        // Prevent closing if processing
        if (payrollStep === "processing") return;
        setPayrollModalOpen(open);
        if (!open) setTimeout(() => setPayrollStep("preview"), 300);
      }}>
        <DialogContent className="sm:max-w-[500px] border-border/40 bg-card text-foreground shadow-2xl overflow-hidden">
          {payrollStep === "preview" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Confirm Payroll</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-0.5">Please review the disbursement summary.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {payrollError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-400 font-medium leading-relaxed">{payrollError}</p>
                </div>
              )}

              <div className="bg-background border border-border/20 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-muted-foreground font-medium">Recipients</span>
                  <span className="font-bold text-foreground">{activeEmps.length} active employees</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-muted-foreground font-medium">Total Disbursement</span>
                  <span className="font-bold text-foreground font-mono">{formatXLM(totalDisbursed)} XLM</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-muted-foreground font-medium">Base Network Fee</span>
                  <span className="font-bold text-amber-400 font-mono">~ {estimatedFee.toFixed(5)} XLM</span>
                </div>
                <div className="border-t border-border/20 pt-4 mt-2 flex justify-between items-center">
                  <span className="text-[15px] font-semibold text-foreground">Total Required</span>
                  <span className="text-[18px] font-extrabold text-foreground font-mono text-primary">
                    {formatXLM(totalDisbursed + estimatedFee)} <span className="text-[12px] text-muted-foreground font-sans">XLM</span>
                  </span>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setPayrollModalOpen(false)} className="border-border/20 bg-transparent text-foreground hover:bg-background">Cancel</Button>
                <Button onClick={startPayrollTracker} disabled={activeEmps.length === 0} className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  Confirm & Sign
                </Button>
              </DialogFooter>
            </>
          )}

          {payrollStep === "processing" && (
            <PayrollTracker
              employees={activeEmps.map((e) => ({
                name: e.name,
                salary: String(e.salary),
                walletAddress: e.walletAddress,
              }))}
              executor={payrollExecutor}
              onComplete={finishPayrollTracker}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
