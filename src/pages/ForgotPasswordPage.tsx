import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.jpg";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Check your email for a reset link");
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
        <Link to="/login" className="flex items-center gap-1 text-sm text-white/70 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-white">Reset Password</h1>
        <p className="mb-8 text-white/80">
          {sent ? "We've sent a reset link to your email." : "Enter your email and we'll send you a reset link."}
        </p>

        {!sent && (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
              />
              <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
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
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-white/40">GRC Shield Platform</p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
