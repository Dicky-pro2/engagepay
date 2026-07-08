import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Icons } from "../components/icons/Icons";
import { useAuthStore } from "../store/authStore";
import { cocobaseAuth } from "../services/cocobase";
import { signInWithGoogle } from "../services/googleAuth";
import { notify } from "../utils/notify";
import { AuthShell, GoogleIcon, LoadingSpinner } from "./Login";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const initialRole =
    searchParams.get("role") === "advertiser" ? "advertiser" : "earner";
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState<"advertiser" | "earner">(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.nickname.trim()) errs.nickname = "Nickname is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (!passwordRegex.test(form.password)) {
      errs.password = "Use 8+ chars with upper, lower, number and symbol";
    }
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const result = await cocobaseAuth.register({
        name: form.name,
        nickname: form.nickname.trim(),
        email: form.email,
        password: form.password,
        role,
      });
      if (!result.user) throw new Error("Unable to create account");
      login(
        result.user,
        result.token ?? "backend_token",
        result.refreshToken ?? "backend_refresh",
      );
      notify.success(`Welcome to Zynk, ${result.user.name}! 🎉`);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Account creation failed";
      console.error("Cocobase signup error", error);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { credential } = await signInWithGoogle();
      const result = await cocobaseAuth.googleLogin(credential, role);
      if (!result.user) throw new Error("Unable to create account");

      login(
        result.user,
        result.token ?? "backend_token",
        result.refreshToken ?? "backend_refresh",
      );
      notify.success(`Welcome to Zynk, ${result.user.name}! 🎉`);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-up failed";
      console.error("Cocobase Google signup error", error);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-sora font-bold text-2xl mb-1">Create your account</h1>
      <p className="text-slatec text-sm mb-5">
        Choose how you'd like to use Zynk.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <RoleButton
          active={role === "earner"}
          onClick={() => setRole("earner")}
          icon={<Icons.Earner size={20} />}
          label="Earner"
          color="green"
        />
        <RoleButton
          active={role === "advertiser"}
          onClick={() => setRole("advertiser")}
          icon={<Icons.Advertiser size={20} />}
          label="Advertiser"
          color="violet"
        />
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white text-navy font-semibold rounded-xl px-4 py-3 mb-4 hover:opacity-90 transition-all disabled:opacity-60"
      >
        <GoogleIcon /> Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-slatec">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <Icons.User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatec pointer-events-none"
            />
            <input
              className="input pl-10"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="label">Nickname</label>
          <div className="relative">
            <Icons.User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatec pointer-events-none"
            />
            <input
              className="input pl-10"
              placeholder="johndoe"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />
          </div>
          {errors.nickname && (
            <p className="text-red-400 text-xs mt-1">{errors.nickname}</p>
          )}
        </div>

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Icons.Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatec pointer-events-none"
            />
            <input
              type="email"
              className="input pl-10"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Icons.Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatec pointer-events-none"
            />
            <input
              type={showPassword ? "text" : "password"}
              className="input pl-10 pr-10"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slatec hover:text-white transition-colors"
            >
              {showPassword ? (
                <Icons.EyeOff size={16} />
              ) : (
                <Icons.Eye size={16} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <Icons.Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatec pointer-events-none"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="input pl-10 pr-10"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slatec hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <Icons.EyeOff size={16} />
              ) : (
                <Icons.Eye size={16} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full font-sora flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner /> Creating account...
            </span>
          ) : (
            <>
              Create Account <Icons.ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-center text-sm text-slatec mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-light font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: "violet" | "green";
}) {
  const activeClasses = {
    green: "border-emerald2 bg-emerald2/10 text-emerald2",
    violet: "border-violet bg-violet/10 text-violet-light",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 transition-all text-sm font-semibold ${
        active
          ? activeClasses[color]
          : "border-border text-slatec hover:border-white/20"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
