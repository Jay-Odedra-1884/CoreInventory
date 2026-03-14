"use client";

import { useApp } from "@/context/AppContext";

export default function Dashboard() {
  const { authToken, authLoading } = useApp();

  console.log("authLoading:", authLoading);
  console.log("authToken:", authToken);
  
  return <h1>Dashboard</h1>;
}
