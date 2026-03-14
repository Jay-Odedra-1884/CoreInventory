"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

const inputCls = (err) => `w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all bg-gray-50/50 ${
  err ? "border-[#f03e3e] focus:border-[#f03e3e]" : "border-gray-200 focus:border-[#37b24d] focus:ring-2 focus:ring-[#37b24d]/10"
}`;

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function Warehouse({ filters = {}, setWarehouses: pushUp }) {
  const [warehouses, setWarehouses] = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [errs,       setErrs]       = useState({});
  const [form,       setForm]       = useState({ name: "", code: "", address: "" });

  const load = () => {
    fetch(`${API}/warehouse`).then(r => r.json()).then(d => {
      setWarehouses(d);
      pushUp?.(d);
    }).catch(() => {
      const fallback = [
        { id: 1, name: "Main Warehouse", code: "WH1", address: "123 Main St, Mumbai" },
        { id: 2, name: "Warehouse 2",    code: "WH2", address: "456 Park Ave, Delhi"  },
      ];
      setWarehouses(fallback);
      pushUp?.(fallback);
    });
  };

  useEffect(() => { load(); }, []);

  function openAdd()   { setForm({ name: "", code: "", address: "" }); setEditItem(null); setErrs({}); setShowModal(true); }
  function openEdit(w) { setForm({ name: w.name, code: w.code, address: w.address }); setEditItem(w); setErrs({}); setShowModal(true); }
  function closeModal(){ setShowModal(false); setEditItem(null); setErrs({}); }

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = "Warehouse name is required";
    if (!form.code.trim())    e.code    = "Short code is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const url    = editItem ? `${API}/warehouse/${editItem.id}` : `${API}/warehouse`;
      const method = editItem ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      load();
    } catch {
      if (editItem) {
        const updated = warehouses.map(w => w.id === editItem.id ? { ...w, ...form } : w);
        setWarehouses(updated); pushUp?.(updated);
      } else {
        const updated = [...warehouses, { id: Date.now(), ...form }];
        setWarehouses(updated); pushUp?.(updated);
      }
    }
    setSaving(false);
    closeModal();
  }

  async function del(id) {
    if (!confirm("Delete this warehouse?")) return;
    try { await fetch(`${API}/warehouse/${id}`, { method: "DELETE" }); } catch {}
    const updated = warehouses.filter(w => w.id !== id);
    setWarehouses(updated); pushUp?.(updated);
  }

  // Filter applied inside the card
  const visible = filters.warehouse && filters.warehouse !== "All"
    ? warehouses.filter(w => w.name === filters.warehouse)
    : warehouses;

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-50">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Warehouse</h3>
            {filters.warehouse && filters.warehouse !== "All" && (
              <p className="text-[11px] text-[#37b24d] mt-0.5">Showing: {filters.warehouse}</p>
            )}
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1 rounded bg-[#37b24d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add warehouse
          </button>
        </div>

        <div className="space-y-2">
          {visible.length === 0 && (
            <p className="text-sm text-gray-300 text-center py-8">No warehouses found</p>
          )}
          {visible.map(w => (
            <div key={w.id} className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">{w.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{w.code} · {w.address}</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold shrink-0">
                <button onClick={() => openEdit(w)} className="text-blue-500 hover:text-blue-700 transition-colors">Edit</button>
                <button onClick={() => del(w.id)}   className="text-[#f03e3e] hover:text-red-700 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={closeModal} title={editItem ? "Edit Warehouse" : "Add Warehouse"}>
        <div className="space-y-1 mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Warehouse Name <span className="text-[#f03e3e]">*</span></label>
          <input required className={inputCls(errs.name)} placeholder="e.g. Main Warehouse" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          {errs.name && <p className="text-[11px] text-[#f03e3e]">{errs.name}</p>}
        </div>
        <div className="space-y-1 mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Short Code <span className="text-[#f03e3e]">*</span></label>
          <input required className={inputCls(errs.code)} placeholder="e.g. WH1" value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          {errs.code && <p className="text-[11px] text-[#f03e3e]">{errs.code}</p>}
        </div>
        <div className="space-y-1 mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Address <span className="text-[#f03e3e]">*</span></label>
          <input required className={inputCls(errs.address)} placeholder="e.g. 123 Main St, Mumbai" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          {errs.address && <p className="text-[11px] text-[#f03e3e]">{errs.address}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={closeModal}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#37b24d] hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? "Saving…" : editItem ? "Update" : "Add Warehouse"}
          </button>
        </div>
      </Modal>
    </>
  );
}