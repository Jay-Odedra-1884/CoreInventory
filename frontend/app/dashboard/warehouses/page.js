"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth");
      return;
    }
    loadWarehouses();
  }, [router]);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/warehouses");
      if (response?.success) {
        setWarehouses(response.data || []);
        setError(null);
      } else {
        setError(response?.message || "Failed to load warehouses");
      }
    } catch (err) {
      setError("Error loading warehouses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">Warehouses</h1>
          </div>
          <p className="text-gray-600 text-base">Manage your warehouse locations and inventory</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#37b24d]"></div>
            <p className="mt-4 text-gray-600">Loading warehouses...</p>
          </div>
        ) : (
          <>
            {/* Warehouse Grid */}
            {warehouses.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-50">
                <p className="text-gray-600 text-lg">No warehouses found. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((warehouse) => (
                  <Link key={warehouse.id} href={`/dashboard/warehouses/${warehouse.code}`}>
                    <div className="group h-full rounded-2xl bg-white p-6 shadow-sm border border-gray-50 hover:shadow-md hover:border-[#37b24d]/20 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#37b24d] transition-colors">
                            {warehouse.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{warehouse.code}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-400">Address: </span>
                          {warehouse.address}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-[#37b24d] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        View Details
                        <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
