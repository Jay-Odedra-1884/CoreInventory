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

export default function ProductCategoryManager({ onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/product-categories");
      if (response?.success) {
        setCategories(response.data || []);
        onCategoriesChanged?.(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
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

  function openEdit(category) {
    setForm({ name: category.name });
    setEditItem(category);
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
    if (!form.name.trim()) e.name = "Category name is required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);

    try {
      let response;
      if (editItem) {
        response = await apiFetch(`/product-categories/${editItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: form.name }),
        });
      } else {
        response = await apiFetch("/product-categories", {
          method: "POST",
          body: JSON.stringify({ name: form.name }),
        });
      }

      if (response?.success) {
        await loadCategories();
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

  async function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await apiFetch(`/product-categories/${id}`, {
        method: "DELETE",
      });
      if (response?.success) {
        await loadCategories();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100">
        <p className="text-gray-500 text-center py-10">Loading categories...</p>
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
              Product Categories
            </h3>
            <p className="text-sm text-gray-500 mt-1">{categories.length} categor(ies) created</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-[#37b24d] px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 shadow-md transition-all hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-lg bg-gray-50 px-6 py-10 border border-gray-100 text-center">
              <p className="text-sm text-gray-400">No categories created yet. Start by adding your first category.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-white px-5 py-3 border border-gray-100 hover:border-[#37b24d] hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{category.name}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {category.id}</p>
                  </div>
                  <div className="flex gap-4 text-sm font-semibold shrink-0">
                    <button
                      onClick={() => openEdit(category)}
                      className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-[#f03e3e] hover:text-red-700 hover:underline transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={closeModal} title={editItem ? "Edit Category" : "Add Category"}>
        {errs.submit && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{errs.submit}</p>
          </div>
        )}
        <div className="space-y-1 mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Category Name <span className="text-[#f03e3e]">*</span>
          </label>
          <input
            required
            className={inputCls(errs.name)}
            placeholder="e.g. Electronics, Raw Materials"
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
          {saving ? "Saving..." : editItem ? "Update Category" : "Add Category"}
        </button>
      </Modal>
    </>
  );
}
