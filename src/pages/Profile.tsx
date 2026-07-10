import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "../components/icons/Icons";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { notify } from "../utils/notify";
import { cocobaseAuth, cocobaseProfile } from "../services/cocobase";
import { LoadingSpinner } from "./Login";

export default function Profile() {
  const { user, updateName, logout } = useAuthStore();
  const { transactions, submissions, myTasks } = useAppStore();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  // Verification state
  const [verifyStep, setVerifyStep] = useState<
    "idle" | "sending" | "sent" | "done"
  >("idle");

  const isAdvertiser = user?.role === "advertiser";
  const isVerified = user?.isEmailVerified ?? false;

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      notify.error("Name cannot be empty");
      return;
    }
    if (nameInput.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    if (!user?.id) {
      notify.error("Your session is unavailable. Please sign in again.");
      return;
    }

    setSavingName(true);
    try {
      await cocobaseProfile.updateName(user.id, nameInput.trim());
      updateName(nameInput.trim());
      notify.success("Name updated successfully!");
      setEditingName(false);
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : "Could not update your profile.",
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(user?.name ?? "");
    setEditingName(false);
  };

  // Purpose: request a real verification email from Cocobase so the user can confirm ownership.
  const handleSendCode = async () => {
    setVerifyStep("sending");
    try {
      await cocobaseAuth.requestEmailVerification();
      setVerifyStep("sent");
      notify.success("Verification link sent to your email!");
    } catch (error) {
      setVerifyStep("idle");
      notify.error(
        error instanceof Error
          ? error.message
          : "Unable to send verification email",
      );
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Profile</h1>
        <p className="text-slatec text-sm">Manage your account details.</p>
      </div>

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-sora font-bold flex-shrink-0 ${
              isAdvertiser
                ? "bg-violet/20 text-violet-light"
                : "bg-emerald2/20 text-emerald2"
            }`}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  className="input py-1.5 text-base font-semibold"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="text-emerald2 hover:text-emerald-400 transition-colors flex-shrink-0"
                >
                  <Icons.Confirm size={18} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-slatec hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Icons.Close size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-sora font-bold text-xl">{user?.name}</h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-slatec hover:text-white transition-colors"
                >
                  <Icons.Edit size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm text-slatec mb-2">
              <Icons.Mail size={13} />
              {user?.email}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isAdvertiser
                    ? "bg-violet/10 border-violet/30 text-violet-light"
                    : "bg-emerald2/10 border-emerald2/30 text-emerald2"
                }`}
              >
                {isAdvertiser ? (
                  <span className="flex items-center gap-1">
                    <Icons.Advertiser size={11} /> Advertiser
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Icons.Earner size={11} /> Earner
                  </span>
                )}
              </span>
              {isVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald2 bg-emerald2/10 border border-emerald2/30 px-2.5 py-1 rounded-full font-semibold">
                  <Icons.Verified size={12} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3 flex items-center gap-2">
          <Icons.Trending size={15} /> Account Stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
              <Icons.Wallet size={12} /> Balance
            </div>
            <div className="font-sora font-bold text-lg sm:text-xl text-amber-400">
              {(user?.walletBalance ?? 0).toLocaleString()}
              <span className="text-xs font-normal text-slatec ml-1">
                coins
              </span>
            </div>
          </motion.div>

          {isAdvertiser ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <Icons.Tasks size={12} /> Tasks Posted
                </div>
                <div className="font-sora font-bold text-xl text-violet-light">
                  {myTasks.length}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <Icons.CoinOut size={12} /> Coins Spent
                </div>
                <div className="font-sora font-bold text-xl">
                  {(user?.totalSpent ?? 0).toLocaleString()}
                  <span className="text-xs font-normal text-slatec ml-1">
                    coins
                  </span>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <Icons.Star size={12} /> Tasks Done
                </div>
                <div className="font-sora font-bold text-xl text-violet-light">
                  {submissions.length}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <Icons.Trending size={12} /> Total Earned
                </div>
                <div className="font-sora font-bold text-xl text-emerald2">
                  {(user?.totalEarned ?? 0).toLocaleString()}
                  <span className="text-xs font-normal text-slatec ml-1">
                    coins
                  </span>
                </div>
              </motion.div>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
              <Icons.Trending size={12} /> Transactions
            </div>
            <div className="font-sora font-bold text-xl">
              {transactions.length}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── EMAIL VERIFICATION FEATURE ── */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3 flex items-center gap-2">
          <Icons.Verified size={15} /> Email Verification
        </h2>

        <AnimatePresence mode="wait">
          {/* Already verified */}
          {isVerified || verifyStep === "done" ? (
            <motion.div
              key="verified"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald2/15 flex items-center justify-center flex-shrink-0">
                <Icons.Verified size={24} className="text-emerald2" />
              </div>
              <div>
                <div className="font-semibold text-emerald2 flex items-center gap-1.5">
                  <Icons.Approve size={15} /> Email Verified
                </div>
                <div className="text-xs text-slatec mt-0.5">
                  {user?.email} is verified. Your account has full access.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unverified"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-5 space-y-4"
            >
              {/* Status row */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Icons.Warning size={22} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5 mb-0.5">
                    <Icons.Mail size={14} /> Email Not Verified
                  </div>
                  <div className="text-xs text-slatec leading-relaxed">
                    Verify <strong className="text-white">{user?.email}</strong>{" "}
                    to unlock full account access, withdrawals, and trust
                    badges.
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {(verifyStep === "idle" || verifyStep === "sending") && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-slatec">
                      We will send a verification link to your email address.
                      Open it to confirm your account.
                    </p>
                    <button
                      onClick={handleSendCode}
                      disabled={verifyStep === "sending"}
                      className="btn-primary w-full font-sora flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {verifyStep === "sending" ? (
                        <>
                          <LoadingSpinner /> Sending Link...
                        </>
                      ) : (
                        <>
                          <Icons.Send size={15} /> Send Verification Link
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {verifyStep === "sent" && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-slatec">
                      A verification link was sent to{" "}
                      <strong className="text-white">{user?.email}</strong>.
                      Open it from your inbox to complete verification.
                    </p>
                    <button
                      onClick={handleSendCode}
                      className="text-xs text-slatec hover:text-violet-light transition-colors w-full text-center flex items-center justify-center gap-1"
                    >
                      <Icons.Refresh size={12} /> Resend link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account info */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3 flex items-center gap-2">
          <Icons.Lock size={15} /> Account Info
        </h2>
        <div className="card divide-y divide-border">
          <InfoRow label="Email" value={user?.email ?? "—"} />
          <InfoRow
            label="Role"
            value={isAdvertiser ? "Advertiser" : "Earner"}
          />
          <InfoRow label="Member Since" value="June 2026" />
          <InfoRow
            label="Email Status"
            value={isVerified ? "Verified" : "Not Verified"}
            valueColor={isVerified ? "text-emerald2" : "text-amber-400"}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3 flex items-center gap-2">
          <Icons.Warning size={15} /> Account Actions
        </h2>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold">Log out</div>
              <div className="text-xs text-slatec">
                Sign out of your account on this device.
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                notify.info("Logged out successfully");
                navigate("/");
              }}
              className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Icons.Logout size={15} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  valueColor = "text-white",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 gap-4">
      <span className="text-sm text-slatec">{label}</span>
      <span className={`text-sm font-medium text-right ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}
