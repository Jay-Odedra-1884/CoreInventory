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

export default function LocationManager({ warehouseCode }) {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, [warehouseCode]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/locations/warehouse/${warehouseCode}`);
      if (response?.success) {
        setLocations(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setLoading(false);
    }
  };

  function openAdd() {
    setForm({ name: "" });
    setEditItem(null);
    setErrs({});
    setShowModal(true);
  }

  function openEdit(location) {
    setForm({ name: location.name });
    setEditItem(location);
    setErrs({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    setErrs({});
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Location name is required";
    else if (form.name.trim().length < 2) e.name = "Location name must be at least 2 characters";
    else if (form.name.trim().length > 255) e.name = "Location name cannot exceed 255 characters";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);

    try {
      let response;
      if (editItem) {
        response = await apiFetch(`/locations/${editItem.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            warehouse_code: warehouseCode,
          }),
        });
      } else {
        response = await apiFetch("/locations", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            warehouse_code: warehouseCode,
          }),
        });
      }

      if (response?.success) {
        await loadLocations();
        closeModal();
      } else {
        setErrs({ submit: response?.message || "Operation failed" });
      }
    } catch (err) {
      console.error("Error:", err);
      setErrs({ submit: "An error occurred" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteLocation(id) {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await apiFetch(`/locations/${id}`, { method: "DELETE" });
      if (response?.success) {
        await loadLocations();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-50">
        <p className="text-gray-500 text-center py-8">Loading locations...</p>
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
              Warehouse Locations
            </h3>
            <p className="text-sm text-gray-500 mt-1">{locations.length} location(s) available</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-[#37b24d] px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 shadow-md transition-all hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Location
          </button>
        </div>

        <div className="space-y-3">
          {locations.length === 0 ? (
            <div className="rounded-lg bg-gray-50 px-6 py-10 border border-gray-100 text-center">
              <p className="text-sm text-gray-400">No locations created yet. Add your first rack or shelf.</p>
            </div>
          ) : (
            locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-white px-5 py-3 border border-gray-100 hover:border-[#37b24d] hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{location.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{location.code}</p>
                </div>
                <div className="flex gap-4 text-sm font-semibold shrink-0">
                  <button
                    onClick={() => openEdit(location)}
                    className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLocation(location.id)}
                    className="text-[#f03e3e] hover:text-red-700 hover:underline transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={closeModal} title={editItem ? "Edit Location" : "Add Location"}>
        {errs.submit && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{errs.submit}</p>
          </div>
        )}
        <div className="space-y-1 mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Location Name <span className="text-[#f03e3e]">*</span>
          </label>
          <input
            required
            autoFocus
            className={inputCls(errs.name)}
            placeholder="e.g. Rack A, Shelf B, Storage 1"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          {errs.name && <p className="text-[11px] text-[#f03e3e]">{errs.name}</p>}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-[#37b24d] text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </Modal>
    </>
  );
}
