"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const { authToken, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !authToken) {
      router.replace("/auth");
    }
  }, [authToken, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authToken) return null;

  return children;
}
