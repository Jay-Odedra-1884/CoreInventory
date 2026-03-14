"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const inputCls = (err) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all bg-gray-50/50 ${
    err
      ? "border-[#f03e3e] focus:border-[#f03e3e]"
      : "border-gray-200 focus:border-[#37b24d] focus:ring-2 focus:ring-[#37b24d]/10"
  }`;

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function StockManager({ warehouseCode }) {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [form, setForm] = useState({ product_id: "", location_id: "", quantity: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [warehouseCode]);

  useEffect(() => {
    if (products.length > 0) {
      console.log("Products loaded:", products);
    }
  }, [products]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stocks
      const stockRes = await apiFetch(`/stocks/warehouse/${warehouseCode}`);
      if (stockRes?.success) {
        const flatStocks = [];
        const data = stockRes.data || {};
        Object.values(data).forEach((group) => {
          flatStocks.push(...(Array.isArray(group) ? group : []));
        });
        setStocks(flatStocks);
        console.log("Stocks loaded:", flatStocks);
      }

      // Load products - ensure we get the data correctly
      const productRes = await apiFetch("/products");
      if (productRes?.success && Array.isArray(productRes.data)) {
        setProducts(productRes.data);
        console.log("Products loaded:", productRes.data);
      } else if (productRes?.success && productRes.data) {
        const prods = Array.isArray(productRes.data) ? productRes.data : [];
        setProducts(prods);
        console.log("Products loaded (converted):", prods);
      }

      // Load locations
      const locRes = await apiFetch(`/locations/warehouse/${warehouseCode}`);
      console.log("Location response:", locRes);
      if (locRes?.success) {
        const locs = Array.isArray(locRes.data) ? locRes.data : [];
        setLocations(locs);
        console.log("Locations loaded:", locs);
      } else {
        console.log("Failed to load locations:", locRes);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  function openAdd() {
    setForm({ product_id: "", location_id: "", quantity: "" });
    setErrs({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ product_id: "", location_id: "", quantity: "" });
    setErrs({});
  }

  function validate() {
    const e = {};
    if (!form.product_id) e.product_id = "Product is required";
    if (!form.location_id) e.location_id = "Location is required";
    const qty = parseInt(form.quantity);
    if (!form.quantity || isNaN(qty) || qty < 1)
      e.quantity = "Quantity must be a positive number";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    setErrs({});

    try {
      const payload = {
        product_id: parseInt(form.product_id),
        location_id: parseInt(form.location_id),
        quantity: parseInt(form.quantity),
      };

      console.log("Sending stock payload:", payload);

      const response = await apiFetch("/stocks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Stock response:", response);

      if (response?.success) {
        await loadData();
        closeModal();
      } else {
        const errorMsg = response?.message || response?.errors?.message || "Operation failed";
        setErrs({ submit: errorMsg });
        console.error("Stock add error:", response);
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      setErrs({ submit: "An error occurred while adding stock" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteStock(id) {
    if (!confirm("Are you sure you want to delete this stock?")) return;

    try {
      const response = await apiFetch(`/stocks/${id}`, { method: "DELETE" });
      if (response?.success) {
        await loadData();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.name} (${product.sku})` : "Unknown";
  };

  const getLocationName = (locationId) => {
    const location = locations.find((l) => l.id === locationId);
    return location ? location.name : "Unknown";
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100">
        <p className="text-gray-500 text-center py-10">Loading product stock...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-[#37b24d] rounded"></span>
              Product Stock Management
            </h3>
            <p className="text-sm text-gray-500 mt-1">{stocks.length} stock record(s)</p>
          </div>
          <button
            onClick={openAdd}
            disabled={locations.length === 0}
            className="flex items-center gap-2 rounded-lg bg-[#37b24d] px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Stock
          </button>
        </div>

        {/* Stocks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Product</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Location</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Quantity</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                    No stocks found
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {stock.product_name || getProductName(stock.product_id)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {stock.location_name || getLocationName(stock.location_id)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">{stock.quantity}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteStock(stock.id)}
                        className="text-[#f03e3e] hover:text-red-700 transition-colors text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={closeModal} title="Add Stock">
        {errs.submit && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{errs.submit}</p>
          </div>
        )}

        {locations.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">No locations available. Please add locations to this warehouse first.</p>
          </div>
        )}

        <div className="space-y-1 mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Product <span className="text-[#f03e3e]">*</span>
          </label>
          <select
            className={inputCls(errs.product_id)}
            value={form.product_id}
            onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
          >
            <option value="">Select a product</option>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))
            ) : (
              <option disabled>No products available</option>
            )}
          </select>
          {errs.product_id && <p className="text-[11px] text-[#f03e3e]">{errs.product_id}</p>}
        </div>

        <div className="space-y-1 mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Location <span className="text-[#f03e3e]">*</span>
          </label>
          <select
            className={inputCls(errs.location_id)}
            value={form.location_id}
            onChange={(e) => setForm((f) => ({ ...f, location_id: e.target.value }))}
          >
            <option value="">Select a location</option>
            {Array.isArray(locations) && locations.length > 0 ? (
              locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))
            ) : (
              <option disabled>No locations available</option>
            )}
          </select>
          {errs.location_id && <p className="text-[11px] text-[#f03e3e]">{errs.location_id}</p>}
        </div>

        <div className="space-y-1 mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Quantity <span className="text-[#f03e3e]">*</span>
          </label>
          <input
            type="number"
            min="1"
            className={inputCls(errs.quantity)}
            placeholder="e.g. 50"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
          {errs.quantity && <p className="text-[11px] text-[#f03e3e]">{errs.quantity}</p>}
        </div>

        <button
          onClick={save}
          disabled={saving || locations.length === 0}
          className="w-full py-2.5 rounded-xl bg-[#37b24d] text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Adding..." : "Add Stock"}
        </button>
      </Modal>
    </>
  );
}
