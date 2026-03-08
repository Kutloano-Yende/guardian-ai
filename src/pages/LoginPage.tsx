import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, EyeOff, Eye, CheckSquare, Square } from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to dashboard
    navigate("/");
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
      {/* Glassmorphism card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/20 p-10 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <h1 className="mb-2 font-display text-4xl font-bold text-white">Login</h1>
        <p className="mb-8 text-white/80">Welcome back, please login to your account</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div className="relative">
            <input
              type="text"
              placeholder="User Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-0"
            />
            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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

          {/* Remember me */}
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            {rememberMe ? (
              <CheckSquare className="h-5 w-5 text-secondary" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            Remember me
          </button>

          {/* Login button */}
          <button
            type="submit"
            className="w-full rounded-xl py-3.5 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, hsl(165 45% 45%), hsl(145 55% 50%))",
            }}
          >
            Login
          </button>
        </form>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-white/70">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-semibold text-white hover:underline"
          >
            Signup
          </button>
        </p>

        <p className="mt-8 text-center text-xs text-white/40">
          GRC Shield Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
