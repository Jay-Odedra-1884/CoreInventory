"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";


// ─── Validation ───────────────────────────────────────────────────────────────
const validateLoginId = (v) => v.length >= 6 && v.length <= 12;
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePassword = (v) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[^A-Za-z0-9]/.test(v);
const validateName = (v) => v.trim().length >= 2;


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
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${isSigned === val
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
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);

  const idErr =
    touched.loginId && !validateLoginId(loginId)
      ? "Must be 6–12 characters"
      : "";
  const passErr = touched.password && !password ? "Password is required" : "";

  const router = useRouter();

  async function submit() {
    setTouched({ loginId: true, password: true });
    if (!validateLoginId(loginId) || !password) return;
    setLoading(true);

    try {

      apiFetch("/dashboard",{})
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ login_id: loginId, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log("Login successful:", data);
        if (data.token) {
         localStorage.setItem("authToken", data.token);
          router.push("/dashboard");
        }
      } else {
        setApiErr(data.message || "Invalid Login ID or Password");
      }
    } catch (err) {
      setApiErr("Unable to connect to the server. Please try again later.");
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Field label="Login ID" error={idErr}>
        <Input
          placeholder="Enter your login ID"
          maxLength={12}
          value={loginId}
          onChange={(e) => {
            setLoginId(e.target.value);
            setApiErr("");
          }}
          onBlur={() => setTouched((t) => ({ ...t, loginId: true }))}
          error={idErr}
          success={!idErr && touched.loginId && loginId}
        />
      </Field>

      <Field label="Password" error={passErr || apiErr}>
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setApiErr("");
          }}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passErr || apiErr}
          success={!passErr && !apiErr && touched.password && password}
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
            Signing in…
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        No account?{" "}
        <span
          onClick={onSwitch}
          className="text-indigo-600 font-semibold cursor-pointer hover:text-indigo-800 transition-colors"
        >
          Sign Up
        </span>
      </p>
    </>
  );
}

// ─── Signup ───────────────────────────────────────────────────────────────────
function SignupForm({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const s = passwordStrength(password);
  const nameErr = touched.name && !validateName(name) ? "Name is required" : "";
  const emailErr =
    touched.email && !validateEmail(email) ? "Enter a valid email" : "";
  const passErr =
    touched.password && !validatePassword(password)
      ? "Min 8 chars · A–Z · a–z · special char"
      : "";

  async function submit() {
    setTouched({ name: true, email: true, password: true });
    if (!validateName(name) || !validateEmail(email) || !validatePassword(password))
      return;

    setLoading(true);
    setApiErr("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegisteredUser(data.data);
      } else {
        // Handle Laravel validation errors
        if (data.message && typeof data.message === "object") {
          const firstErr = Object.values(data.message)[0][0];
          setApiErr(firstErr);
        } else {
          setApiErr(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      setApiErr("Unable to connect to the server. Please check your connection.");
      console.error("Signup Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    if (registeredUser?.login_id) {
      navigator.clipboard.writeText(registeredUser.login_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {registeredUser && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-5 mb-6 transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3 font-bold text-sm">
            <span className="bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">✓</span>
            Account Created!
          </div>

          <p className="text-[11px] mb-2 text-emerald-600 font-medium">Your uniquely assigned Login ID:</p>

          <div className="relative group">
            <div className="bg-white border border-emerald-100 rounded-lg py-3 text-center text-xl font-mono font-bold tracking-[0.2em] text-emerald-600 shadow-inner">
              {registeredUser.login_id}
            </div>
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-emerald-50 rounded-md transition-colors text-emerald-400 hover:text-emerald-600"
              title="Copy to clipboard"
            >
              {copied ? (
                <span className="text-[10px] font-bold">Copied!</span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              )}
            </button>
          </div>

          <p className="text-[10px] mt-4 text-emerald-600/60 leading-relaxed italic">
            Please save this ID. You will need it to sign in to your account.
          </p>

          <button
            onClick={onSwitch}
            className="w-full mt-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Continue to Sign In
          </button>
        </div>
      )}

      {apiErr && !registeredUser && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-xl px-4 py-3 mb-4 font-medium flex items-center gap-2">
          <span>⚠</span> {apiErr}
        </div>
      )}

      <Field label="Full Name" error={nameErr}>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setApiErr("");
          }}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={nameErr}
          success={!nameErr && touched.name && name}
        />
      </Field>

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

      <Field label="Password" error={passErr}>
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
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= s ? strengthBar[s] : "bg-gray-100"
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

      <button
        onClick={submit}
        disabled={loading || registeredUser}
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
