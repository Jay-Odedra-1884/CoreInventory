"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

export default function Receipts() {
  const [data, setData] = useState({ to_receive: 0, late: 0, operations: 0 });

  useEffect(() => {
    fetch(`${API}/receipts/summary`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ to_receive: 4, late: 1, operations: 6 }));
  }, []);

  return (
    <div className="flex flex-col justify-center rounded-2xl bg-white p-6 shadow-sm border border-gray-50 cursor-pointer hover:shadow-md transition-shadow h-full">
      <h3 className="mb-3 text-[15px] font-semibold text-gray-900">Receipts</h3>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{data.to_receive} to receive</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#f03e3e]">{data.late} Late</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{data.operations} operations</span>
        </div>
      </div>
    </div>
  );
}