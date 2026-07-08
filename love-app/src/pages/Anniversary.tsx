import { useEffect, useState, useCallback } from "react";
import { request } from "../utils/request.js";
import type { Anniversary } from "../utils/types.js";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function AnniversaryPage() {
  const [items, setItems] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formRecurring, setFormRecurring] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request<Anniversary[]>("/api/anniversaries");
      setItems(data);
    } catch (err: any) {
      setError(err.message || "\u52a0\u8f7d\u5931\u8d25");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditing(null); setFormTitle(""); setFormDate(""); setFormRecurring(1); setShowForm(true); };
  const openEdit = (item: Anniversary) => { setEditing(item); setFormTitle(item.title); setFormDate(formatDate(item.date)); setFormRecurring(item.is_recurring); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;
    setSubmitting(true);
    try {
      const body = JSON.stringify({ title: formTitle, date: formDate, is_recurring: formRecurring });
      if (editing) { await request("/api/anniversaries/" + editing.id, { method: "PUT", body }); }
      else { await request("/api/anniversaries", { method: "POST", body }); }
      setShowForm(false); fetchItems();
    } catch (err: any) { setError(err.message || "\u4fdd\u5b58\u5931\u8d25"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try { await request("/api/anniversaries/" + id, { method: "DELETE" }); setDeleteConfirm(null); fetchItems(); }
    catch (err: any) { setError(err.message || "\u5220\u9664\u5931\u8d25"); }
  };

  const calcDaysLeft = (item: Anniversary): number => {
    if (item.days_left != null) return item.days_left;
    const target = new Date(item.date); const now = new Date();
    if (item.is_recurring === 1) { target.setFullYear(now.getFullYear()); if (target.getTime() < now.getTime()) target.setFullYear(now.getFullYear() + 1); }
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-warm-700">\u7eaa\u5ff5\u65e5</h1>
        <button onClick={openAdd} className="w-8 h-8 rounded-full bg-warm-500 flex items-center justify-center shadow-md shadow-warm-200 active:scale-95 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500 mb-3">{error}</div>}
      {loading ? (<div className="space-y-3">{[1,2].map((i:number) => (<div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"><div className="h-4 bg-warm-100 rounded w-24 mb-2"/><div className="h-3 bg-warm-50 rounded w-32"/></div>))}</div>)
      : items.length === 0 ? (<div className="bg-white rounded-2xl p-8 shadow-sm text-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5" className="mx-auto mb-3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p className="text-sm text-gray-400">\u8fd8\u6ca1\u6709\u7eaa\u5ff5\u65e5</p><p className="text-xs text-gray-300 mt-1">\u70b9\u51fb\u53f3\u4e0a\u89d2\u6dfb\u52a0</p></div>)
      : (<div className="space-y-3">{items.map((item: Anniversary) => (
        <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm"><div className="flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold text-gray-900">{item.title}</p>{item.is_recurring === 1 && <span className="text-[10px] bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded-full">\u6bcf\u5e74</span>}</div><p className="text-xs text-gray-400 mt-1">{formatDate(item.date)}</p></div><div className="text-right mr-3"><p className="text-lg font-bold text-warm-500">{calcDaysLeft(item)}</p><p className="text-[10px] text-warm-300">\u5929\u540e</p></div><div className="flex gap-1"><button onClick={() => openEdit(item)} className="w-7 h-7 rounded-full bg-warm-50 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button onClick={() => setDeleteConfirm(item.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></div></div>))}</div>)}
      {showForm && (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowForm(false)}><div className="w-full max-w-[390px] bg-white rounded-t-3xl p-6 pb-8" onClick={(e: React.MouseEvent) => e.stopPropagation()}><div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/><h2 className="text-base font-semibold text-gray-900 mb-4">{editing ? "\u7f16\u8f91\u7eaa\u5ff5\u65e5" : "\u65b0\u589e\u7eaa\u5ff5\u65e5"}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-xs text-warm-500 mb-1.5">\u6807\u9898</label><input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="\u5982\uff1a\u786e\u5b9a\u5173\u7cfb\u65e5" className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"/></div><div><label className="block text-xs text-warm-500 mb-1.5">\u65e5\u671f</label><input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"/></div><div className="flex items-center gap-3"><label className="text-xs text-warm-500">\u6bcf\u5e74\u91cd\u590d</label><button type="button" onClick={() => setFormRecurring(formRecurring === 1 ? 0 : 1)} className={"w-10 h-6 rounded-full transition-colors relative " + (formRecurring === 1 ? "bg-warm-500" : "bg-gray-200")}><div className={"w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform " + (formRecurring === 1 ? "translate-x-5" : "translate-x-1")}/></button></div><div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-warm-200 text-sm text-warm-500">\u53d6\u6d88</button><button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-warm-500 text-white text-sm font-medium shadow-md disabled:opacity-50">{submitting ? "\u4fdd\u5b58\u4e2d..." : "\u4fdd\u5b58"}</button></div></form></div></div>)}
      {deleteConfirm !== null && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-8"><div className="w-full max-w-xs bg-white rounded-2xl p-6 text-center"><p className="text-sm font-semibold text-gray-900 mb-1">\u786e\u8ba4\u5220\u9664</p><p className="text-xs text-gray-400 mb-5">\u5220\u9664\u540e\u65e0\u6cd5\u6062\u590d</p><div className="flex gap-3"><button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500">\u53d6\u6d88</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">\u5220\u9664</button></div></div></div>)}
    </div>
  );
}
