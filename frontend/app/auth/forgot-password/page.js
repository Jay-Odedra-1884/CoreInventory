"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePassword = (v) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[^A-Za-z0-9]/.test(v);
const validateOtp = (v) => /^\d{6}$/.test(v);

function passwordStrength(v) {
  return [
    v.length >= 8,
    /[A-Z]/.test(v),
    /[a-z]/.test(v),
    /[^A-Za-z0-9]/.test(v),
  ].filter(Boolean).length;
}

const strengthBar = [
  "",
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-emerald-500",
];

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

const strengthTxt = [
  "",
  "text-red-400",
  "text-orange-400",
  "text-yellow-500",
  "text-emerald-500",
];

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ error, success, className = "", ...props }) {
  const [focused, setFocused] = useState(false);
  const ring = error
    ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
    : success
      ? "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400 focus:ring-emerald-100"
      : focused
        ? "border-indigo-300 bg-white focus:border-indigo-400 focus:ring-indigo-100"
        : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-white";

  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800
        placeholder-gray-300 outline-none transition-all duration-200
        focus:ring-2 focus:bg-white ${ring} ${className}`}
    />
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="mb-1">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide">
        {label}
      </label>
      {children}
      <div className="min-h-[20px] mt-1">
        {error && (
          <p className="text-[11px] text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-8 select-none">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" opacity="0.95" />
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" opacity="0.55" />
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.55" />
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.95" />
        </svg>
      </div>
      <span className="text-[17px] font-bold text-gray-800 tracking-tight">
        CoreInventory
      </span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ─── Step 1: Email Validation ─────────────────────────────────────────────
  const emailErr =
    touched.email && !validateEmail(email) ? "Enter a valid email" : "";

  const submitEmail = async () => {
    setTouched({ email: true });
    if (!validateEmail(email)) return;

    setLoading(true);
    setApiErr("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_URL}/forgot-password/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("OTP sent to your email. Please check your inbox.");
        setTimeout(() => {
          setStep(2);
          setSuccessMsg("");
        }, 1500);
      } else {
        setApiErr(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setApiErr("Unable to connect to the server. Please try again.");
      console.error("Send OTP Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: OTP Validation ───────────────────────────────────────────────
  const otpErr =
    touched.otp && !validateOtp(otp) ? "OTP must be 6 digits" : "";

  const verifyOtp = async () => {
    setTouched({ ...touched, otp: true });
    if (!validateOtp(otp)) return;

    setLoading(true);
    setApiErr("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_URL}/forgot-password/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("OTP verified successfully.");
        setTimeout(() => {
          setStep(3);
          setSuccessMsg("");
        }, 1500);
      } else {
        setApiErr(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setApiErr("Unable to connect to the server. Please try again.");
      console.error("Verify OTP Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Password Reset ───────────────────────────────────────────────
  const passErr =
    touched.password && !validatePassword(password)
      ? "Min 8 chars · A–Z · a–z · special char"
      : "";
  const confirmErr =
    touched.confirmPassword && password !== confirmPassword
      ? "Passwords do not match"
      : "";

  const s = passwordStrength(password);

  const resetPassword = async () => {
    setTouched({ ...touched, password: true, confirmPassword: true });
    if (!validatePassword(password) || password !== confirmPassword) return;

    setLoading(true);
    setApiErr("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_URL}/forgot-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp, password, password_confirmation: confirmPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      } else {
        setApiErr(data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setApiErr("Unable to connect to the server. Please try again.");
      console.error("Reset Password Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <Logo />

          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  step >= s ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 && "Reset Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Create New Password"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a strong password for your account"}
          </p>

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2 font-medium">
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* Error Message */}
          {apiErr && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2 font-medium">
              <span>⚠</span> {apiErr}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <>
              <Field label="Email Address" error={emailErr}>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setApiErr("");
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  error={emailErr}
                  success={!emailErr && touched.email && email}
                />
              </Field>

              <button
                onClick={submitEmail}
                disabled={loading || !email}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-4
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  active:scale-[0.98] transition-all duration-200
                  shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Sending OTP…
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
            <>
              <Field label="6-Digit OTP Code" error={otpErr}>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtp(val);
                    setApiErr("");
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, otp: true }))}
                  error={otpErr}
                  success={!otpErr && touched.otp && otp}
                  className="text-center text-2xl tracking-[0.3em] font-mono"
                />
              </Field>

              <p className="text-xs text-gray-400 text-center mb-4">
                Did not receive the code?{" "}
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setTouched({});
                  }}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                >
                  Try a different email
                </button>
              </p>

              <button
                onClick={verifyOtp}
                disabled={loading || !otp}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  active:scale-[0.98] transition-all duration-200
                  shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </>
          )}

          {/* Step 3: Password Reset */}
          {step === 3 && (
            <>
              <Field label="New Password" error={passErr}>
                <Input
                  type="password"
                  placeholder="Min 8 chars, A–Z, a–z, special"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setApiErr("");
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  error={passErr}
                  success={s === 4}
                />
                {password && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          i <= s ? strengthBar[s] : "bg-gray-100"
                        }`}
                      />
                    ))}
                    <span
                      className={`text-[11px] font-semibold ml-1 min-w-[32px] transition-colors ${
                        strengthTxt[s]
                      }`}
                    >
                      {strengthLabel[s]}
                    </span>
                  </div>
                )}
              </Field>

              <Field label="Confirm Password" error={confirmErr}>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setApiErr("");
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                  error={confirmErr}
                  success={!confirmErr && touched.confirmPassword && confirmPassword}
                />
              </Field>

              <button
                onClick={resetPassword}
                disabled={loading || !password || !confirmPassword}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-4
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  active:scale-[0.98] transition-all duration-200
                  shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Resetting…
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </>
          )}

          {/* Back to Login Link */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Remember your password?{" "}
            <Link
              href="/auth"
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
