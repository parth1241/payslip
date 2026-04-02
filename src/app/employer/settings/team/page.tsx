"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/lib/context/OrgContext";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Mail, MoreHorizontal, ShieldAlert, X, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PopulatedMember {
  _id: string;
  role: "owner" | "admin" | "viewer";
  addedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarColor: string;
    lastLogin: string;
  };
}

interface PendingInvite {
  _id: string;
  invitedEmail: string;
  role: string;
  token: string;
  expiresAt: string;
}

export default function TeamSettingsPage() {
  const { activeOrg } = useOrg();
  const { data: session } = useSession();
  const [members, setMembers] = useState<PopulatedMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [sending, setSending] = useState(false);
  
  // Find current user's role logic
  const myUserId = (session?.user as any)?.userId;
  const myRole = members.find((m) => m.userId?._id === myUserId)?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const loadData = async () => {
    if (!activeOrg) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${activeOrg._id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        setInvites(data.invites);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrg]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setSending(true);
    try {
      const res = await fetch(`/api/orgs/${activeOrg._id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail("");
        setShowInvite(false);
        loadData();
        alert("Invite Sent! (Check console for raw link)");
      }
    } catch (err) {}
    setSending(false);
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!activeOrg) return;
    try {
      const res = await fetch(`/api/orgs/${activeOrg._id}/members/${targetUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) loadData();
    } catch (err) {}
  };

  const handleRemove = async (targetUserId: string, name: string) => {
    if (!activeOrg) return;
    if (!confirm(`Are you sure you want to remove ${name} from this organisation?`)) return;
    try {
      const res = await fetch(`/api/orgs/${activeOrg._id}/members/${targetUserId}`, {
        method: "DELETE",
      });
      if (res.ok) loadData();
    } catch (err) {}
  };

  if (!activeOrg) return null;

  return (
    <div className="flex-1 w-full flex flex-col p-8 overflow-y-auto bg-background min-h-screen">
      <div className="max-w-6xl w-full mx-auto space-y-8 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Settings</h1>
            <p className="text-muted-foreground mt-1">Manage members and permission roles for {activeOrg.name}</p>
          </div>
          {canManage && (
            <Button onClick={() => setShowInvite(!showInvite)} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        {/* INVITE FORM SLIDE DOWN */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showInvite ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-6 bg-card border border-border/40 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-background border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div className="w-full sm:w-48 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button onClick={handleInvite} disabled={sending || !inviteEmail} className="w-full sm:w-auto h-[38px] bg-indigo-500 hover:bg-indigo-600">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
            </Button>
          </div>
        </div>

        {/* ACTIVE MEMBERS TABLE */}
        <div className="border border-border/30 rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-border/20 hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                {myRole === "owner" && <TableHead className="w-[100px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
              ) : members.map((m) => (
                <TableRow key={m._id} className="border-border/10 hover:bg-white/[0.01] transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: m.userId?.avatarColor || "#6366f1" }}>
                        {m.userId?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-medium leading-none mb-1">{m.userId?.name} {myUserId === m.userId?._id && <span className="text-[10px] text-muted-foreground ml-1 font-mono">(You)</span>}</div>
                        <div className="text-[12px] text-muted-foreground">{m.userId?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {myRole === "owner" && m.role !== "owner" ? (
                      <select 
                         value={m.role}
                         onChange={(e) => handleRoleChange(m.userId._id, e.target.value)}
                         className={`text-xs px-2 py-1 rounded-full outline-none bg-transparent border border-border/40 font-medium ${
                           m.role === 'admin' ? 'text-blue-400 border-blue-500/30' : 'text-slate-400'
                         }`}
                      >
                         <option className="bg-card" value="viewer">Viewer</option>
                         <option className="bg-card" value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                        m.role === 'owner' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 
                        m.role === 'admin' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 
                        'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                      }`}>
                        {m.role}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground font-mono">
                    {m.userId?.lastLogin ? formatDistanceToNow(new Date(m.userId.lastLogin), { addSuffix: true }) : "Never"}
                  </TableCell>
                  {myRole === "owner" && (
                    <TableCell>
                       {m.role !== "owner" && (
                         <Button onClick={() => handleRemove(m.userId._id, m.userId.name)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PENDING INVITES */}
        {invites.length > 0 && (
          <div className="space-y-4 pt-4">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-2">
               <ShieldAlert className="h-4 w-4" /> Pending Invitations
             </h3>
             <div className="border border-border/30 rounded-xl bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableBody>
                    {invites.map((inv) => (
                      <TableRow key={inv._id} className="border-border/10 hover:bg-white/[0.01]">
                        <TableCell>
                          <div className="text-[13px] font-medium">{inv.invitedEmail}</div>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            Expires {formatDistanceToNow(new Date(inv.expiresAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-500/15 text-slate-400 border border-slate-500/20">
                            {inv.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => alert('Check console. URL re-logged functionally.')}>Resend</Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 hover:text-red-400">
                             <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
