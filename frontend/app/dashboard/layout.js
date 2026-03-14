"use client";

import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">{children}</div>
    </AuthGuard>
  );
}
