import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, EyeOff, Eye, UserPlus, User as UserIcon, Building2, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.jpg";

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    department: "",
    jobTitle: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.fullName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          department: form.department,
          job_title: form.jobTitle,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to verify your account!");
      navigate("/login");
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

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
        <h1 className="mb-2 font-display text-4xl font-bold text-white">Sign Up</h1>
        <p className="mb-8 text-white/80">Create your GRC Shield account</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name *"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
            />
            <UserIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
            />
            <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password * (min 6 chars)"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Department"
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
              />
              <Building2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Job Title"
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
              />
              <Briefcase className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(145 55% 50%))",
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Login
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-white/40">GRC Shield Platform</p>
      </div>
    </div>
  );
};

export default SignupPage;
