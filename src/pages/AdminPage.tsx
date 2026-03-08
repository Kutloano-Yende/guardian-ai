import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, UserCog, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type AppRole = "admin" | "risk_manager" | "audit_manager" | "compliance_officer" | "user";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  risk_manager: "Risk Manager",
  audit_manager: "Audit Manager",
  compliance_officer: "Compliance Officer",
  user: "User",
};

const ALL_ROLES: AppRole[] = ["admin", "risk_manager", "audit_manager", "compliance_officer", "user"];

interface UserWithRoles {
  id: string;
  full_name: string;
  department: string;
  job_title: string;
  created_at: string;
  roles: AppRole[];
}

export default function AdminPage() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [roleToAdd, setRoleToAdd] = useState<AppRole>("user");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: profiles, error: pErr } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (pErr) { toast.error("Failed to load users"); setLoading(false); return; }

    const { data: allRoles, error: rErr } = await supabase.from("user_roles").select("*");
    if (rErr) { toast.error("Failed to load roles"); setLoading(false); return; }

    const roleMap = new Map<string, AppRole[]>();
    (allRoles || []).forEach((r: any) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role as AppRole);
      roleMap.set(r.user_id, existing);
    });

    setUsers(
      (profiles || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name || "Unnamed",
        department: p.department || "—",
        job_title: p.job_title || "—",
        created_at: p.created_at,
        roles: roleMap.get(p.id) || [],
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      if (error.code === "23505") toast.error("User already has this role");
      else toast.error("Failed to add role");
      return;
    }
    toast.success(`Added ${ROLE_LABELS[role]} role`);
    await fetchUsers();
    setSelectedUser((prev) => prev ? { ...prev, roles: [...prev.roles, role] } : null);
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await (supabase.from("user_roles") as any).delete().eq("user_id", userId).eq("role", role);
    if (error) { toast.error("Failed to remove role"); return; }
    toast.success(`Removed ${ROLE_LABELS[role]} role`);
    await fetchUsers();
    setSelectedUser((prev) => prev ? { ...prev, roles: prev.roles.filter((r) => r !== role) } : null);
  };

  if (!hasRole("admin")) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass-card p-12 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">Access Denied</h3>
          <p className="text-muted-foreground text-sm mt-1">You need admin privileges to access this page</p>
        </div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.roles.includes("admin")).length;
  const totalRoles = users.reduce((sum, u) => sum + u.roles.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage users and role assignments</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users} color="primary" subtitle="Registered accounts" />
        <StatCard title="Admins" value={adminCount} icon={ShieldCheck} color="secondary" subtitle="Full access" />
        <StatCard title="Role Assignments" value={totalRoles} icon={UserCog} color="severity-medium" subtitle="Across all users" />
      </motion.div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-foreground">No users found</h3>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Job Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Roles</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--glass-border)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(211 65% 55%))" }}>
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.department}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.job_title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r === "admin" ? "bg-severity-critical/15 text-severity-critical" :
                          r === "risk_manager" ? "bg-severity-high/15 text-severity-high" :
                          r === "audit_manager" ? "bg-primary/15 text-primary" :
                          r === "compliance_officer" ? "bg-status-resolved/15 text-status-resolved" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {ROLE_LABELS[r]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(u)} className="text-xs">
                      Manage Roles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Management Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Manage Roles — {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Roles</p>
              {selectedUser?.roles.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No roles assigned</p>
              ) : (
                <div className="space-y-2">
                  {selectedUser?.roles.map((r) => (
                    <div key={r} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <span className="text-sm text-foreground">{ROLE_LABELS[r]}</span>
                      <Button variant="ghost" size="sm" onClick={() => selectedUser && removeRole(selectedUser.id, r)} className="h-7 w-7 p-0 text-severity-critical hover:text-severity-critical">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4" style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-sm text-muted-foreground mb-2">Add Role</p>
              <div className="flex gap-2">
                <Select value={roleToAdd} onValueChange={(v) => setRoleToAdd(v as AppRole)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.filter((r) => !selectedUser?.roles.includes(r)).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => selectedUser && addRole(selectedUser.id, roleToAdd)}
                  disabled={selectedUser?.roles.includes(roleToAdd)}
                  className="glass-btn-primary w-auto px-4"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
