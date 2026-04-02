"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Check, X, Pencil, Mail, Shield, Bell, Trash2, AlertTriangle } from "lucide-react";
import { addToast } from "@/contexts/ToastContext"; // assume toast context export

// Simple color picker component
function ColorPicker({ current, onSelect }: { current: string; onSelect: (color: string) => void }) {
  const colors = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"]; // 8 shades
  return (
    <div className="flex gap-2 mt-2">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`w-8 h-8 rounded-full border-2 ${c === current ? "border-primary" : "border-transparent"}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

export default function AccountSettings() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<"profile" | "security" | "notifications" | "danger">("profile");

  // PROFILE STATE
  const [avatarColor, setAvatarColor] = useState(session?.user?.avatarColor || "#6366f1");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [editingName, setEditingName] = useState(false);
  const [email, setEmail] = useState(session?.user?.email || "");
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // SECURITY STATE
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");

  // NOTIFICATIONS STATE
  const [prefs, setPrefs] = useState<{ [key: string]: boolean }>({});
  const [prefLoading, setPrefLoading] = useState(true);

  // DANGER ZONE STATE
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Fetch sessions & preferences on mount
  useEffect(() => {
    // Sessions
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .finally(() => setLoadingSessions(false));
    // Preferences
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((data) => setPrefs(data))
      .finally(() => setPrefLoading(false));
  }, []);

  // PROFILE HANDLERS
  const handleAvatarColor = async (color: string) => {
    setAvatarColor(color);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarColor: color }),
    });
    if (res.ok) {
      addToast("Avatar color updated", "success");
      await update();
    } else {
      addToast("Failed to update avatar", "error");
    }
    setShowColorPicker(false);
  };

  const handleNameSave = async () => {
    if (!name) return;
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      addToast("Name updated", "success");
      await router.refresh();
    } else {
      addToast("Failed to update name", "error");
    }
    setEditingName(false);
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/user/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, password: emailPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      addToast("Email updated", "success");
      setEmail(newEmail);
      setChangingEmail(false);
      await router.refresh();
    } else {
      addToast(data.error || "Failed to update email", "error");
    }
  };

  // SECURITY HANDLERS
  const handleRevoke = async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Session revoked", "success");
      setSessions((s) => s.filter((s) => s._id !== sessionId));
    } else {
      addToast("Failed to revoke", "error");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdNew !== pwdConfirm) {
      addToast("Passwords do not match", "error");
      return;
    }
    setChangingPwd(true);
    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwdCurrent, newPassword: pwdNew }),
    });
    const data = await res.json();
    if (res.ok) {
      addToast("Password changed", "success");
    } else {
      addToast(data.error || "Failed", "error");
    }
    setChangingPwd(false);
  };

  // NOTIFICATIONS HANDLERS
  const togglePref = async (key: string) => {
    const newVal = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: newVal }));
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: newVal }),
    });
  };

  // DANGER ZONE HANDLER
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    const res = await fetch("/api/user/delete", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduled: true }),
    });
    if (res.ok) {
      addToast("Account scheduled for deletion", "success");
      await signOut({ callbackUrl: "/" });
    } else {
      addToast("Failed to schedule deletion", "error");
    }
    setDeleting(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Nav */}
      <nav className="w-64 border-r border-border/20 p-4 sticky top-0 h-screen">
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left py-2 px-3 rounded ${activeSection === "profile" ? "bg-primary text-white" : "hover:bg-primary/10"}`}
              onClick={() => setActiveSection("profile")}
            >
              Profile
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left py-2 px-3 rounded ${activeSection === "security" ? "bg-primary text-white" : "hover:bg-primary/10"}`}
              onClick={() => setActiveSection("security")}
            >
              Security
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left py-2 px-3 rounded ${activeSection === "notifications" ? "bg-primary text-white" : "hover:bg-primary/10"}`}
              onClick={() => setActiveSection("notifications")}
            >
              Notifications
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left py-2 px-3 rounded ${activeSection === "danger" ? "bg-primary text-white" : "hover:bg-primary/10"}`}
              onClick={() => setActiveSection("danger")}
            >
              Danger Zone
            </button>
          </li>
        </ul>
      </nav>

      {/* Right Panel */}
      <section className="flex-1 p-8 overflow-y-auto">
        {activeSection === "profile" && (
          <div className="space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16" style={{ backgroundColor: avatarColor }}>
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback>{session?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={() => setShowColorPicker(!showColorPicker)}>
                Change Color
              </Button>
            </div>
            {showColorPicker && <ColorPicker current={avatarColor} onSelect={handleAvatarColor} />}

            {/* Name */}
            <div className="flex items-center gap-2">
              {editingName ? (
                <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameSave} onKeyDown={(e) => e.key === "Enter" && handleNameSave()} />
              ) : (
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {name}
                  <Pencil className="h-4 w-4 cursor-pointer" onClick={() => setEditingName(true)} />
                </h2>
              )}
            </div>

            {/* Email */}
            <div>
              <p className="text-muted-foreground">{email}</p>
              {changingEmail ? (
                <form onSubmit={handleEmailChange} className="flex gap-2 mt-2">
                  <Input placeholder="New email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                  <Input placeholder="Current password" type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required />
                  <Button type="submit">Save</Button>
                  <Button variant="ghost" onClick={() => setChangingEmail(false)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button variant="link" onClick={() => setChangingEmail(true)} className="mt-1">
                  Change email
                </Button>
              )}
            </div>

            {/* Role badge */}
            <div>
              <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {session?.user?.role}
              </span>
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-8">
            <h3 className="text-xl font-semibold">Active Sessions</h3>
            {loadingSessions ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Device</th>
                    <th className="p-2 text-left">IP</th>
                    <th className="p-2 text-left">Last active</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s._id} className="border-b border-border/10">
                      <td className="p-2 flex items-center gap-2">
                        {s.deviceName.includes("Mobile") ? (
                          <svg className="h-5 w-5" /* mobile icon */></svg>
                        ) : (
                          <svg className="h-5 w-5" /* laptop icon */></svg>
                        )}
                        {s.deviceName} – {s.browser}
                        {s.current && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded">Current</span>}
                      </td>
                      <td className="p-2">{s.ip}</td>
                      <td className="p-2">{new Date(s.lastActive).toLocaleString()}</td>
                      <td className="p-2">
                        {!s.current && (
                          <Button variant="outline" size="sm" onClick={() => handleRevoke(s._id)}>
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h3 className="text-xl font-semibold mt-8">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="grid gap-4 max-w-sm">
              <Input placeholder="Current password" type="password" value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)} required />
              <Input placeholder="New password" type="password" value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} required />
              <Input placeholder="Confirm new password" type="password" value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)} required />
              <Button type="submit" disabled={changingPwd}>
                {changingPwd ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Password"}
              </Button>
            </form>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Email Preferences</h3>
            {[
              { key: "payrollRun", label: "Email when payroll runs" },
              { key: "salaryReceived", label: "Email when salary received" },
              { key: "securityAlert", label: "Security alerts for new logins" },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <span>{pref.label}</span>
                <button
                  onClick={() => togglePref(pref.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs[pref.key] ? "bg-primary" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${prefs[pref.key] ? "translate-x-5" : "translate-x-1"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === "danger" && (
          <div className="space-y-6 border border-red-500/30 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-red-600">Delete My Account</h3>
            <p className="text-muted-foreground">This will permanently delete your account in 30 days.</p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="border border-red-500 rounded px-3 py-2 w-64"
            />
            <Button
              variant="destructive"
              disabled={deleteConfirm !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Deletion"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
