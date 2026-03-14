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

function FormField({ label, error, required, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-[#f03e3e]">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-[#f03e3e] mt-1">{error}</p>}
    </div>
  );
}

export default function Products({ filters = {} }) {
  const [products,    setProducts]    = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [errs,        setErrs]        = useState({});
  const [stockFilter, setStockFilter] = useState("All");
  const [form,        setForm]        = useState({ name: "", sku: "", category: "", qty: "", uom: "" });

  const load = () => {
    fetch(`${API}/products`).then(r => r.json()).then(setProducts)
      .catch(() => setProducts([
        { id: 1, sku: "DESK001", name: "Desk",        category: "Furniture",    qty: 24, uom: "Units" },
        { id: 2, sku: "CHAIR02", name: "Chair",       category: "Furniture",    qty: 6,  uom: "Units" },
        { id: 3, sku: "STROD03", name: "Steel Rods",  category: "Raw Material", qty: 77, uom: "Kg"    },
        { id: 4, sku: "LAMP004", name: "Desk Lamp",   category: "Electronics",  qty: 3,  uom: "Units" },
        { id: 5, sku: "CABLE05", name: "Power Cable", category: "Electronics",  qty: 0,  uom: "Pcs"   },
      ]));
  };

  useEffect(() => { load(); }, []);

  function openAdd()   { setForm({ name: "", sku: "", category: "", qty: "", uom: "" }); setEditItem(null); setErrs({}); setShowModal(true); }
  function openEdit(p) { setForm({ name: p.name, sku: p.sku, category: p.category, qty: String(p.qty), uom: p.uom }); setEditItem(p); setErrs({}); setShowModal(true); }
  function closeModal(){ setShowModal(false); setEditItem(null); setErrs({}); }

  function validate() {
    const e = {};
    if (!form.name.trim())                          e.name     = "Product name is required";
    if (!form.sku.trim())                           e.sku      = "SKU is required";
    if (!form.category.trim())                      e.category = "Category is required";
    if (form.qty === "" || isNaN(Number(form.qty))) e.qty      = "Valid quantity is required";
    if (!form.uom.trim())                           e.uom      = "Unit of measure is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, qty: Number(form.qty) };
    try {
      const url    = editItem ? `${API}/products/${editItem.id}` : `${API}/products`;
      const method = editItem ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      load();
    } catch {
      if (editItem) setProducts(ps => ps.map(p => p.id === editItem.id ? { ...p, ...payload } : p));
      else          setProducts(ps => [...ps, { id: Date.now(), ...payload }]);
    }
    setSaving(false);
    closeModal();
  }

  async function del(id) {
    if (!confirm("Delete this product?")) return;
    try { await fetch(`${API}/products/${id}`, { method: "DELETE" }); } catch {}
    setProducts(ps => ps.filter(p => p.id !== id));
  }

  const stockTag = qty =>
    qty === 0 ? { label: "Out of Stock", cls: "bg-[#fff5f5] text-[#f03e3e]" }
    : qty <= 5 ? { label: "Low Stock",   cls: "bg-[#fff4e6] text-[#f59f00]" }
    :            { label: "In Stock",    cls: "bg-[#ebfbee] text-[#37b24d]" };

  const filtered = products
    .filter(p => filters.category && filters.category !== "All" ? p.category === filters.category : true)
    .filter(p => stockFilter === "Low" ? p.qty > 0 && p.qty <= 5 : stockFilter === "Out" ? p.qty === 0 : true);

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-50">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">All Products</h3>
            {filters.category && filters.category !== "All" && (
              <p className="text-[11px] text-[#37b24d] mt-0.5">Category: {filters.category}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center rounded-lg border border-gray-100 bg-[#f8f9fa] p-1 font-medium text-gray-500">
              {["All","Low","Out"].map(f => (
                <button key={f} onClick={() => setStockFilter(f)}
                  className={`px-3 py-1 rounded transition-all ${stockFilter === f ? "bg-white text-gray-700 shadow-sm font-semibold" : "hover:text-gray-700"}`}>
                  {f === "All" ? "All" : f === "Low" ? "Low Stock" : "Out of Stock"}
                </button>
              ))}
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-1 rounded bg-[#37b24d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-5 text-[11px] font-bold">
          <span className="rounded-full bg-[#ebfbee] px-3 py-1.5 text-[#37b24d]">{products.filter(p => p.qty > 5).length} In Stock</span>
          <span className="rounded-full bg-[#fff4e6] px-3 py-1.5 text-[#f59f00]">{products.filter(p => p.qty > 0 && p.qty <= 5).length} Low Stock</span>
          <span className="rounded-full bg-[#fff5f5] px-3 py-1.5 text-[#f03e3e]">{products.filter(p => p.qty === 0).length} Out of Stock</span>
        </div>

        {filtered.length === 0 ? (
          <div className="border-t border-gray-50 py-10 text-center text-sm text-gray-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 text-left">SKU</th>
                  <th className="pb-3 text-left">Name</th>
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-left pl-4">UoM</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const tag = stockTag(p.qty);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-mono text-gray-400 text-xs">[{p.sku}]</td>
                      <td className="py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="py-3 text-gray-500">{p.category}</td>
                      <td className="py-3 text-right font-semibold text-gray-800">{p.qty}</td>
                      <td className="py-3 pl-4 text-gray-400">{p.uom}</td>
                      <td className="py-3"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tag.cls}`}>{tag.label}</span></td>
                      <td className="py-3 text-center space-x-3 text-xs font-semibold">
                        <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 transition-colors">Edit</button>
                        <button onClick={() => del(p.id)}   className="text-[#f03e3e] hover:text-red-700 transition-colors">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={closeModal} title={editItem ? "Edit Product" : "Add Product"}>
        <FormField label="Product Name" error={errs.name} required>
          <input className={inputCls(errs.name)} placeholder="e.g. Steel Rods" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </FormField>
        <FormField label="SKU / Code" error={errs.sku} required>
          <input className={inputCls(errs.sku)} placeholder="e.g. STROD03" value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} />
        </FormField>
        <FormField label="Category" error={errs.category} required>
          <input className={inputCls(errs.category)} placeholder="e.g. Raw Material" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
        </FormField>
        <div className="flex gap-3">
          <FormField label="Qty" error={errs.qty} required>
            <input className={inputCls(errs.qty)} type="number" min="0" placeholder="0" value={form.qty}
              onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
          </FormField>
          <FormField label="Unit of Measure" error={errs.uom} required>
            <input className={inputCls(errs.uom)} placeholder="Units / Kg / Pcs" value={form.uom}
              onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} />
          </FormField>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={closeModal}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#37b24d] hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? "Saving…" : editItem ? "Update Product" : "Add Product"}
          </button>
        </div>
      </Modal>
    </>
  );
}