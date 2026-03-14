"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LocationManager from "@/components/Warehouse/LocationManager";
import StockManager from "@/components/Warehouse/StockManager";

export default function WarehouseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const warehouseCode = params.code;

  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth");
      return;
    }
    loadWarehouse();
  }, [warehouseCode, router]);

  const loadWarehouse = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/warehouses/${warehouseCode}`);
      if (response?.success) {
        setWarehouse(response.data);
        setError(null);
      } else {
        setError(response?.message || "Warehouse not found");
      }
    } catch (err) {
      setError("Error loading warehouse");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#37b24d]"></div>
          <p className="mt-4 text-gray-600">Loading warehouse details...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-10">
          <button
            onClick={() => router.back()}
            className="mb-6 text-[#37b24d] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Warehouses
          </button>
          <div className="rounded-2xl bg-white p-12 text-center shadow-md border border-gray-100">
            <p className="text-gray-600 text-lg">{error || "Warehouse not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-8 py-10">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="mb-8 text-[#37b24d] font-semibold flex items-center gap-2 hover:gap-3 transition-all hover:text-green-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Warehouses
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">{warehouse.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <span className="text-sm">
              <span className="font-semibold text-gray-700">Code:</span> <span className="text-gray-600">{warehouse.code}</span>
            </span>
            <span className="text-sm">
              <span className="font-semibold text-gray-700">Address:</span> <span className="text-gray-600">{warehouse.address}</span>
            </span>
          </div>
        </div>

        {/* Warehouse Info Card */}
        <div className="mb-10 rounded-2xl bg-white p-8 shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-[#37b24d] rounded"></span>
            Warehouse Information
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Warehouse Name
              </p>
              <p className="text-base font-medium text-gray-900">{warehouse.name}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Code
              </p>
              <p className="text-base font-medium text-gray-900">{warehouse.code}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Address
              </p>
              <p className="text-base font-medium text-gray-900">{warehouse.address}</p>
            </div>
          </div>
        </div>

        {/* Locations and Stocks Sections */}
        <div className="space-y-6">
          <LocationManager warehouseCode={warehouse.code} />
          <StockManager warehouseCode={warehouse.code} />
        </div>
      </div>
    </div>
  );
}
