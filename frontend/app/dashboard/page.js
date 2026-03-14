"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Receipts from "./Receipts";
import Deliveries from "./Deliveries";
import Warehouse from "./Warehouse";
import Products from "./Products";

const API = "http://localhost:8000/api";

function KpiCard({ label, value, sub }) {
  return (
    <div className="flex flex-col justify-center rounded-2xl bg-white p-8 shadow-md border border-gray-100 hover:shadow-lg hover:border-[#37b24d]/20 transition-all">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{value}</p>
      </div>
      {sub && <p className="text-[11px] font-medium text-gray-500 mt-2">{sub}</p>}
    </div>
  );
}

function Graph({ receipts = 545, deliveries = 0, net = -545 }) {
  const max = 600;
  const rPct = Math.min((receipts / max) * 100, 100);
  const dPct = Math.min((deliveries / max) * 100, 100);

  return (
    <div className="flex flex-col rounded-2xl bg-white p-8 shadow-md border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Performance Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory flow</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-[#37b24d]/10 text-[#37b24d] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Current Month</span>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-[220px] relative mt-2">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-[9px] font-bold text-gray-300 text-right pb-8 shrink-0 w-8">
          {[600, 450, 300, 150, 0].map(v => <span key={v}>{v}</span>)}
        </div>

        {/* Chart Area */}
        <div className="relative flex-1 border-b border-gray-100 pb-8">
          {/* Grid Lines */}
          {[75, 50, 25].map(p => (
            <div key={p} className="absolute w-full border-t border-gray-50" style={{ bottom: `calc(${p}% + 32px)` }} />
          ))}

          <div className="flex h-full items-end justify-center gap-12 px-4">
            {/* Receipts Bar */}
            <div className="relative group flex flex-col items-center w-10">
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-0.5 rounded -translate-y-1 font-bold">₹{receipts}</div>
              <div className="w-full rounded-t-lg transition-all duration-700 ease-out shadow-sm ring-1 ring-inset ring-black/5"
                style={{ height: `${rPct}%`, background: "linear-gradient(to top, #fa5252, #f03e3e)" }} />
              <span className="absolute -bottom-6 text-[10px] font-bold text-gray-400">RECEIPTS</span>
            </div>

            {/* Deliveries Bar */}
            <div className="relative group flex flex-col items-center w-10">
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-0.5 rounded -translate-y-1 font-bold">₹{deliveries}</div>
              <div className="w-full rounded-t-lg transition-all duration-700 ease-out shadow-sm ring-1 ring-inset ring-black/5"
                style={{ height: `${dPct}%`, background: "linear-gradient(to top, #40c057, #37b24d)" }} />
              <span className="absolute -bottom-6 text-[10px] font-bold text-gray-400">DELIVERY</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <span className="h-3 w-3 rounded-full bg-[#f03e3e]" /> Receipts
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <span className="h-3 w-3 rounded-full bg-[#37b24d]" /> Deliveries
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm font-bold px-4 py-1.5 rounded-full border ${net >= 0 ? "text-[#37b24d] bg-green-50 border-green-200" : "text-[#f03e3e] bg-red-50 border-red-200"}`}>
          {net >= 0 ? "↑" : "↓"} ₹{Math.abs(net).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState({ receipts: 545, deliveries: 0, net: -545 });
  const [kpi, setKpi] = useState({ total_products: 0, low_stock: 0, out_of_stock: 0, pending_receipts: 0, pending_deliveries: 0, internal_transfers: 0 });
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: "Home", href: "/dashboard", id: "home" },
    { label: "Warehouses", href: "/dashboard/warehouses", id: "warehouses" },
    { label: "Products", href: "/dashboard", id: "products" },
    { label: "Operations", href: "/dashboard", id: "operations" },
  ];

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth");
      return;
    }
    
    // Load dashboard data
    setLoading(false);
    fetch(`${API}/dashboard`).then(r => r.json()).then(setData).catch(() => { });
    fetch(`${API}/dashboard/kpi`).then(r => r.json()).then(setKpi)
      .catch(() => setKpi({ total_products: 148, low_stock: 5, out_of_stock: 2, pending_receipts: 4, pending_deliveries: 6, internal_transfers: 3 }));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#37b24d] mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 font-sans pb-12">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-[#37b24d] to-green-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 underline decoration-[#37b24d] decoration-3 underline-offset-4">CoreInventory</h1>
          </Link>
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-full">
            {navItems.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  item.href === "/dashboard/warehouses"
                    ? "bg-[#37b24d] text-white shadow-md hover:bg-green-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-10">

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <KpiCard label="Total Inventory" value={kpi.total_products} sub="Unique items in stock" />
          <KpiCard label="Critical Alerts" value={kpi.low_stock + kpi.out_of_stock} sub={`${kpi.out_of_stock} empty · ${kpi.low_stock} low`} />
          <KpiCard label="Pending In" value={kpi.pending_receipts} sub="Incoming shipments" />
          <KpiCard label="Pending Out" value={kpi.pending_deliveries} sub="Orders to fulfill" />
          <KpiCard label="Internal" value={kpi.internal_transfers} sub="Transfer requests" />
        </div>

        {/* Row 1: Receipts + Deliveries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Receipts />
          <Deliveries />
        </div>

        {/* Row 2: Graph + Warehouse side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Warehouse />
          <Graph receipts={data.receipts} deliveries={data.deliveries} net={data.net} />
        </div>

        {/* Row 3: Products full width */}
        <Products />

      </div>
    </div>
  );
}
