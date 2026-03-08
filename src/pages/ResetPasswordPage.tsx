import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeOff, Eye, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.jpg";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValid(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/");
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/20 p-10 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <h1 className="mb-2 font-display text-3xl font-bold text-white">Set New Password</h1>
        <p className="mb-8 text-white/80">Enter your new password below</p>

        {!valid ? (
          <p className="text-white/60 text-sm text-center py-8">
            Invalid or expired reset link. Please request a new one from the login page.
          </p>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
              />
              <KeyRound className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(145 55% 50%))",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-white/40">GRC Shield Platform</p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
