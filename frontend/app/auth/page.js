"use client";

import { useState } from "react";

// ─── Validation ───────────────────────────────────────────────────────────────
const validateLoginId = (v) => v.trim().length >= 6 && v.trim().length <= 12;
const validateEmail = (v) => v.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePassword = (v) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[^A-Za-z0-9]/.test(v.trim());

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
          <rect
            x="2"
            y="2"
            width="7"
            height="7"
            rx="1.5"
            fill="white"
            opacity="0.95"
          />
          <rect
            x="11"
            y="2"
            width="7"
            height="7"
            rx="1.5"
            fill="white"
            opacity="0.55"
          />
          <rect
            x="2"
            y="11"
            width="7"
            height="7"
            rx="1.5"
            fill="white"
            opacity="0.55"
          />
          <rect
            x="11"
            y="11"
            width="7"
            height="7"
            rx="1.5"
            fill="white"
            opacity="0.95"
          />
        </svg>
      </div>
      <span className="text-[17px] font-bold text-gray-800 tracking-tight">
        CoreInventory
      </span>
    </div>
  );
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────
function Tabs({ isSigned, setIsSigned }) {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1 mb-7">
      {[
        ["Sign In", true],
        ["Sign Up", false],
      ].map(([label, val]) => (
        <button
          key={label}
          onClick={() => setIsSigned(val)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
            isSigned === val
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const [loginId,  setLoginId]  = useState("");
  const [password, setPassword] = useState("");
  const [touched,  setTouched]  = useState({});
  const [apiErr,   setApiErr]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const idErr   = touched.loginId  && !validateLoginId(loginId) ? "Must be 6–12 characters" : "";
  const passErr = touched.password && !password ? "Password is required" : "";

  async function submit() {
    setTouched({ loginId: true, password: true });
    if (!validateLoginId(loginId) || !password) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setApiErr("Invalid Login ID or Password");
  }

  return (
    <>
      <Field label="Login ID" error={idErr}>
        <Input
          placeholder="Enter your login ID"
          maxLength={12}
          value={loginId}
          onChange={(e) => setLoginId(e.target.value.trim())}
          onBlur={() => setTouched(t => ({ ...t, loginId: true }))}
          error={idErr}
          success={!idErr && touched.loginId && validateLoginId(loginId)}
        />
      </Field>

      <Field label="Password" error={passErr || apiErr}>
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value.trim())}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
          error={passErr || apiErr}
          success={!passErr && !apiErr && touched.password && !!password}
        />
      </Field>

      <div className="flex justify-end mb-5">
        <span className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer font-medium transition-colors">
          Forgot password?
        </span>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white
          bg-gradient-to-r from-indigo-600 to-violet-600
          hover:from-indigo-500 hover:to-violet-500
          active:scale-[0.98] transition-all duration-200
          shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Signing in…
          </span>
        ) : "Sign In"}
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        No account?{" "}
        <span onClick={onSwitch} className="text-indigo-600 font-semibold cursor-pointer hover:text-indigo-800 transition-colors">
          Sign Up
        </span>
      </p>
    </>
  );
}

// ─── Signup ───────────────────────────────────────────────────────────────────
function SignupForm({ onSwitch }) {
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const s = passwordStrength(password);
  const idErr =
    touched.loginId && !validateLoginId(loginId)
      ? "Must be 6–12 characters"
      : "";
  const emailErr =
    touched.email && !validateEmail(email.trim()) ? "Enter a valid email" : "";
  const passErr =
    touched.password && !validatePassword(password)
      ? "Min 8 chars · A–Z · a–z · special char"
      : "";
  const confirmErr =
    touched.confirm && confirm !== password ? "Passwords don't match" : "";

  async function submit() {
    setTouched({ loginId: true, email: true, password: true, confirm: true });
    if (
      !validateLoginId(loginId) ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      confirm !== password
    )
      return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // remove in prod
    // TODO: await fetch("/api/auth/signup", { method:"POST", body: JSON.stringify({loginId, email, password}) })
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onSwitch();
    }, 2000);
  }

  return (
    <>
      {done && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl px-4 py-3 mb-4 font-medium">
          <span className="text-base">✓</span> Account created! Redirecting…
        </div>
      )}

      <Field label="Login ID" error={idErr}>
        <Input
          placeholder="6–12 characters, unique"
          maxLength={12}
          value={loginId}
          onChange={(e) => setLoginId(e.target.value.trim())}
          onBlur={() => setTouched((t) => ({ ...t, loginId: true }))}
          error={idErr}
          success={!idErr && touched.loginId && validateLoginId(loginId)}

        />
      </Field>

      <Field label="Email" error={emailErr}>
        <Input
          type="text"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailErr}
          success={!emailErr && touched.email && validateEmail(email)}
        />
      </Field>

      <Field label="Password" error={passErr}>
        <Input
          type="password"
          placeholder="Min 8 chars, A–Z, a–z, special"
          value={password}
          onChange={(e) => setPassword(e.target.value.trim())}
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
              className={`text-[11px] font-semibold ml-1 min-w-[32px] transition-colors ${strengthTxt[s]}`}
            >
              {strengthLabel[s]}
            </span>
          </div>
        )}
      </Field>

      <Field label="Re-enter Password" error={confirmErr}>
        <Input
          type="password"
          placeholder="Confirm your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.trim())}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={confirmErr}
          success={
            !confirmErr && touched.confirm && confirm === password && !!confirm
          }
        />
      </Field>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1
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
            Creating account…
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        Have an account?{" "}
        <span
          onClick={onSwitch}
          className="text-indigo-600 font-semibold cursor-pointer hover:text-indigo-800 transition-colors"
        >
          Sign In
        </span>
      </p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [isSigned, setIsSigned] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 flex items-center justify-center px-4 py-12">
      {/* Decorative blobs — purely visual, pointer-events-none */}
      <div className="fixed top-[-100px] right-[-80px] w-[360px] h-[360px] bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="fixed bottom-[-80px] left-[-60px] w-[280px] h-[280px] bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <Logo />
        <Tabs isSigned={isSigned} setIsSigned={setIsSigned} />

        {/* Card */}
        <div className="bg-white rounded-3xl px-8 py-8 shadow-xl shadow-indigo-100/60 border border-gray-100/80">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isSigned ? "Welcome back " : "Get started"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isSigned
                ? "Sign in to manage your inventory"
                : "Create your CoreInventory account"}
            </p>
          </div>

          {isSigned ? (
            <LoginForm onSwitch={() => setIsSigned(false)} />
          ) : (
            <SignupForm onSwitch={() => setIsSigned(true)} />
          )}
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-6">
          CoreInventory © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
