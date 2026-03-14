"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProductCategoryManager from "@/components/Product/ProductCategoryManager";

const API = "http://localhost:8000/api";

const inputCls = (err) => `w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all bg-gray-50/50 ${err ? "border-[#f03e3e] focus:border-[#f03e3e]" : "border-gray-200 focus:border-[#37b24d] focus:ring-2 focus:ring-[#37b24d]/10"
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
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [stockFilter, setStockFilter] = useState("All");
  const [form, setForm] = useState({ name: "", category_id: "", unit: "", price: "", cost: "" });
  const [categories, setCategories] = useState([]);

  const load = async () => {
    try {
      const response = await apiFetch("/products");
      if (response?.success) {
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    }
  };

  useEffect(() => { 
    loadCategories();
    load(); 
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiFetch("/product-categories");
      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  function openAdd() { 
    setForm({ name: "", category_id: "", unit: "", price: "", cost: "" }); 
    setEditItem(null); 
    setErrs({}); 
    setShowModal(true); 
  }
  
  function openEdit(p) { 
    setForm({ 
      name: p.name, 
      category_id: p.category_id, 
      unit: p.unit, 
      price: String(p.price), 
      cost: String(p.cost) 
    }); 
    setEditItem(p); 
    setErrs({}); 
    setShowModal(true); 
  }
  
  function closeModal() { setShowModal(false); setEditItem(null); setErrs({}); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.category_id) e.category_id = "Category is required";
    if (!form.unit) e.unit = "Unit of measure is required";
    if (form.price === "" || isNaN(Number(form.price))) e.price = "Valid price is required";
    if (form.cost === "" || isNaN(Number(form.cost))) e.cost = "Valid cost is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    const payload = { 
      name: form.name, 
      category_id: parseInt(form.category_id),
      unit: form.unit,
      price: Number(form.price),
      cost: Number(form.cost)
    };
    
    try {
      const url = editItem ? `/products/${editItem.id}` : `/products`;
      const method = editItem ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (res?.success) {
        load();
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaving(false);
    closeModal();
  }

  async function del(id) {
    if (!confirm("Delete this product?")) return;
    try { 
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "Unknown";
  };

  const filtered = products
    .filter(p => filters.category && filters.category !== "All" ? p.category?.name === filters.category : true)

  return (
    <>
      {/* Product Categories Manager */}
      <ProductCategoryManager onCategoriesChanged={(cats) => setCategories(cats)} />

      {/* Products Table */}
      <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100 mt-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-[#37b24d] rounded"></span>
              All Products
            </h3>
            {filters.category && filters.category !== "All" && (
              <p className="text-sm text-[#37b24d] mt-1">Category: {filters.category}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1 font-medium text-gray-600">
              {["All", "Low", "Out"].map(f => (
                <button key={f} onClick={() => setStockFilter(f)}
                  className={`px-4 py-2 rounded-md transition-all ${stockFilter === f ? "bg-white text-gray-900 shadow-sm font-semibold border border-gray-200" : "hover:text-gray-900"}`}>
                  {f === "All" ? "All" : f === "Low" ? "Low Stock" : "Out of Stock"}
                </button>
              ))}
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-[#37b24d] px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 shadow-md transition-all hover:shadow-lg">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-6 text-sm font-bold">
          <span className="rounded-full bg-[#ebfbee] px-4 py-2 text-[#37b24d]">{products.length} Total Products</span>
        </div>

        {filtered.length === 0 ? (
          <div className="border-t border-gray-100 py-12 text-center text-sm text-gray-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-4 text-left">SKU</th>
                  <th className="pb-4 text-left">Name</th>
                  <th className="pb-4 text-left">Category</th>
                  <th className="pb-4 text-left">Unit</th>
                  <th className="pb-4 text-right">Price</th>
                  <th className="pb-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 font-mono text-gray-500 text-xs">[{p.sku}]</td>
                    <td className="py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 text-gray-600">{p.category?.name || "N/A"}</td>
                    <td className="py-3 text-gray-600">{p.unit}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">₹{Number(p.price).toLocaleString()}</td>
                    <td className="py-3 text-center space-x-4 text-sm font-semibold">
                      <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 hover:underline transition-colors">Edit</button>
                      <button onClick={() => del(p.id)} className="text-[#f03e3e] hover:text-red-700 hover:underline transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
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
        
        <FormField label="Category" error={errs.category_id} required>
          <select className={inputCls(errs.category_id)} value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Unit of Measure" error={errs.unit} required>
          <select className={inputCls(errs.unit)} value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
            <option value="">Select unit</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="piece">Piece</option>
            <option value="liter">Liter</option>
            <option value="meter">Meter</option>
          </select>
        </FormField>

        <div className="flex gap-3">
          <FormField label="Cost Price (₹)" error={errs.cost} required>
            <input className={inputCls(errs.cost)} type="number" min="0" step="0.01" placeholder="0.00" value={form.cost}
              onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
          </FormField>
          <FormField label="Selling Price (₹)" error={errs.price} required>
            <input className={inputCls(errs.price)} type="number" min="0" step="0.01" placeholder="0.00" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
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