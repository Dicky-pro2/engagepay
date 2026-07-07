import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Icons } from "../components/icons/Icons";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { notify } from "../utils/notify";
import { cocobaseAuth, isCocobaseEnabled } from "../services/cocobase";

type Status = "verifying" | "success" | "already_verified" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, verifyEmail } = useAuthStore();
  const { addNotification } = useAppStore();
  const [status, setStatus] = useState<Status>("verifying");

  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      // If already verified, no need to go further
      if (user?.isEmailVerified) {
        setStatus("already_verified");
        return;
      }

      // No token in URL
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        if (isCocobaseEnabled) {
          await cocobaseAuth.verifyEmail();
        } else {
          await new Promise((r) => setTimeout(r, 1500));
        }

        if (token.length >= 10 || isCocobaseEnabled) {
          verifyEmail();
          addNotification({
            type: "welcome",
            title: "Email Verified!",
            message:
              "Your email has been verified successfully. Your account is now fully active.",
          });
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-violet/15 rounded-full blur-[100px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -bottom-24 -right-24 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 w-full max-w-md relative z-10 text-center"
      >
        {/* Logo */}
        <Link
          to="/"
          className="font-sora font-extrabold text-xl inline-block mb-8"
        >
          Engage<span className="text-violet-light">Pay</span>
        </Link>

        {/* Verifying state */}
        {status === "verifying" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet/15 flex items-center justify-center mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Icons.Refresh size={28} className="text-violet-light" />
              </motion.div>
            </div>
            <h1 className="font-sora font-bold text-xl">
              Verifying your email...
            </h1>
            <p className="text-slatec text-sm">Please wait a moment.</p>
          </motion.div>
        )}

        {/* Success state */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-emerald2/15 flex items-center justify-center mx-auto"
            >
              <Icons.Verified size={28} className="text-emerald2" />
            </motion.div>
            <h1 className="font-sora font-bold text-xl">Email Verified!</h1>
            <p className="text-slatec text-sm leading-relaxed">
              Your email has been verified successfully. Your account is now
              fully active.
            </p>
            <div className="pt-2 space-y-2">
              {user ? (
                <button
                  onClick={() => {
                    notify.success("Email verified! Welcome aboard.");
                    navigate("/dashboard");
                  }}
                  className="btn-green w-full font-sora flex items-center justify-center gap-2"
                >
                  <Icons.Dashboard size={16} />
                  Go to Dashboard
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary w-full font-sora flex items-center justify-center gap-2"
                >
                  <Icons.ArrowRight size={16} />
                  Log In to Continue
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Already verified state */}
        {status === "already_verified" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet/15 flex items-center justify-center mx-auto">
              <Icons.Verified size={28} className="text-violet-light" />
            </div>
            <h1 className="font-sora font-bold text-xl">Already Verified</h1>
            <p className="text-slatec text-sm leading-relaxed">
              Your email is already verified. You're all set!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary w-full font-sora flex items-center justify-center gap-2"
            >
              <Icons.Dashboard size={16} />
              Go to Dashboard
            </button>
          </motion.div>
        )}

        {/* Error state */}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto">
              <Icons.Cancel size={28} className="text-red-400" />
            </div>
            <h1 className="font-sora font-bold text-xl">Verification Failed</h1>
            <p className="text-slatec text-sm leading-relaxed">
              This verification link is invalid or has expired. Please request a
              new one.
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => navigate("/resend-verification")}
                className="btn-primary w-full font-sora flex items-center justify-center gap-2"
              >
                <Icons.Mail size={16} />
                Resend Verification Email
              </button>
              <Link
                to={user ? "/dashboard" : "/login"}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <Icons.ArrowLeft size={14} />
                {user ? "Back to Dashboard" : "Back to Login"}
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
