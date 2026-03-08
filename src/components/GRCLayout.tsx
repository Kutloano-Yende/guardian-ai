import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Box, AlertTriangle, FileWarning, ClipboardCheck,
  Shield, Scale, ListTodo, BarChart3, FileText, GraduationCap,
  ChevronLeft, ChevronRight, Bell, User, LogOut, ChevronDown
} from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import loginBg from "@/assets/login-bg.jpg";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  risk_manager: "Risk Manager",
  audit_manager: "Audit Manager",
  compliance_officer: "Compliance Officer",
  user: "User",
};

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/assets", label: "Assets", icon: Box },
  { path: "/risks", label: "Risks", icon: AlertTriangle },
  { path: "/incidents", label: "Incidents", icon: FileWarning },
  { path: "/audits", label: "Audits", icon: ClipboardCheck },
  { path: "/compliance", label: "Compliance", icon: Shield },
  { path: "/governance", label: "Governance", icon: Scale },
  { path: "/actions", label: "Actions", icon: ListTodo },
  { path: "/performance", label: "Performance", icon: BarChart3 },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/training", label: "Training", icon: GraduationCap },
];

export function GRCLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, roles, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const primaryRole = roles.length > 0 ? ROLE_LABELS[roles[0]] || roles[0] : "User";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex flex-col shrink-0 border-r"
        style={{
          background: "rgba(30, 41, 59, 0.85)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(211 65% 55%))" }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-display font-bold text-white text-lg whitespace-nowrap">
                GRC Shield
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active ? "text-white" : "text-white/60 hover:text-white/90"
                }`}
                style={active ? {
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                } : {}}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom of sidebar */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-3 border-t"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3 px-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(211 65% 55%))" }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-white/50 truncate">{primaryRole}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 text-white/50 hover:text-white/80 transition-colors"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 border-b"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            borderColor: "var(--glass-border)",
          }}
        >
          <div>
            <h2 className="font-display font-semibold text-foreground">
              {navItems.find((n) => n.path === location.pathname)?.label || "GRC Shield"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-severity-critical" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/10">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(211 65% 55%))" }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {roles.map((r) => ROLE_LABELS[r] || r).join(", ")}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
