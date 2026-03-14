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
    <div className="flex flex-col justify-center rounded-2xl bg-white p-8 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-all h-full">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span className="inline-block w-1 h-6 bg-[#f03e3e] rounded"></span>
        Receipts
      </h3>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{data.to_receive} to receive</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#f03e3e]">{data.late} Late</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{data.operations} operations</span>
        </div>
      </div>
    </div>
  );
}