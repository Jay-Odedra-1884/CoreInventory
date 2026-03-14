"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

export default function Deliveries() {
  const [data, setData] = useState({ to_deliver: 0, late: 0, waiting: 0, operations: 0 });

  useEffect(() => {
    fetch(`${API}/deliveries/summary`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ to_deliver: 4, late: 1, waiting: 2, operations: 6 }));
  }, []);

  return (
    <div className="flex flex-col justify-center rounded-2xl bg-white p-8 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-all h-full">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span className="inline-block w-1 h-6 bg-[#37b24d] rounded"></span>
        Deliveries
      </h3>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{data.to_deliver} to deliver</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#f03e3e]">{data.late} Late</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{data.waiting} waiting</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{data.operations} operations</span>
        </div>
      </div>
    </div>
  );
}