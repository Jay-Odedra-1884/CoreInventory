"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";

const AppContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getErrorMessage = (message) => {
  if (typeof message === "string") return message;
  if (typeof message === "object" && message !== null) {
    const errors = [];
    for (const key in message) {
      if (Array.isArray(message[key])) errors.push(message[key][0]);
      else errors.push(message[key]);
    }
    return errors.join(", ") || "An error occurred";
  }
  return "An error occurred";
};

export const AppProvider = ({ children }) => {
  const router = useRouter();

  const [authToken, setAuthToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [inventoryVersion, setInventoryVersion] = useState(0);
  const notifyInventoryChange = () => setInventoryVersion((v) => v + 1);

  // ── Read token from localStorage on mount ─────────────────────────────────
 useEffect(() => {
   const token = localStorage.getItem("authToken"); 
   if (token) {
     setAuthToken(token);
     validateToken(token);
   } else {
     setAuthLoading(false); 
   }
 }, []);

  // ── Validate token with Laravel /me ───────────────────────────────────────
  const validateToken = async (token) => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("authToken");
        setAuthToken(null);
        setUser(null);
      } else {
        const data = await res.json();
        if (data.success) setUser(data.user);
      }
    } catch {
      // network error — keep token
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("authToken", data.token);
        setAuthToken(data.token);
        setUser(data.user ?? null);
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        toast.error(getErrorMessage(data.message));
      }
      return data;
    } catch {
      toast.error("Login failed. Check your connection.");
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, mobile, password, confirmPassword) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await login(email, password);
      } else {
        toast.error(getErrorMessage(data.message));
      }
      return data;
    } catch {
      toast.error("Registration failed.");
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // logout locally regardless
    } finally {
      localStorage.removeItem("authToken");
      setAuthToken(null);
      setUser(null);
      toast.success("Logged out.");
      router.replace("/auth");
    }
  };

  // ── Forgot Password ───────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const data = await apiFetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (data?.success) toast.success(data.message || "Reset link sent!");
      else toast.error(getErrorMessage(data?.message));
      return data;
    } catch {
      toast.error("Failed to send reset link.");
    }
  };

  // ── Reset Password ────────────────────────────────────────────────────────
  const resetPassword = async (
    token,
    email,
    password,
    passwordConfirmation,
  ) => {
    try {
      const data = await apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      if (data?.success) {
        toast.success("Password reset! Please login.");
        router.push("/auth");
      } else {
        toast.error(getErrorMessage(data?.message));
      }
      return data;
    } catch {
      toast.error("Failed to reset password.");
    }
  };

  return (
    <AppContext.Provider
      value={{
        authToken,
        authLoading,
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        inventoryVersion,
        notifyInventoryChange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
