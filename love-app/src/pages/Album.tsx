import { useEffect, useState, useCallback, useRef } from "react";
import { request } from "../utils/request.js";
import type { Photo } from "../utils/types.js";

export default function Album() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await request<{ items: Photo[] }>("/api/photos?page=1&limit=50"); setPhotos(data.items); }
    catch (err: any) { setError(err.message || "\u52a0\u8f7d\u5931\u8d25"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
      await request("/api/photos", { method: "POST", body: formData });
      fetchPhotos();
    } catch (err: any) { setError(err.message || "\u4e0a\u4f20\u5931\u8d25"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleDelete = async (id: number) => {
    try { await request("/api/photos/" + id, { method: "DELETE" }); setPhotos((prev) => prev.filter((p) => p.id !== id)); }
    catch (err: any) { setError(err.message || "\u5220\u9664\u5931\u8d25"); }
  };

  const preview = previewIdx !== null ? photos[previewIdx] : null;

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-warm-700">\u76f8\u518c</h1>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-500 text-white text-xs font-medium shadow-md shadow-warm-200 active:scale-95 transition-transform disabled:opacity-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {uploading ? "\u4e0a\u4f20\u4e2d..." : "\u4e0a\u4f20"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e)} />
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500 mb-3">{error}</div>}
      {loading ? (<div className="grid grid-cols-3 gap-1.5">{Array.from({ length: 9 }).map((_: unknown, i: number) => (<div key={i} className="aspect-square rounded-xl bg-warm-100 animate-pulse"/>))}</div>)
      : photos.length === 0 ? (<div className="bg-white rounded-2xl p-8 shadow-sm text-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5" className="mx-auto mb-3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p className="text-sm text-gray-400">\u8fd8\u6ca1\u6709\u7167\u7247</p><p className="text-xs text-gray-300 mt-1">\u70b9\u51fb\u4e0a\u4f20\u6dfb\u52a0\u7167\u7247</p></div>)
      : (<div className="grid grid-cols-3 gap-1.5">{photos.map((photo: Photo, idx: number) => (
        <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-warm-100 cursor-pointer active:opacity-80 transition-opacity relative group" onClick={() => setPreviewIdx(idx)}>
          <img src={"http://localhost:3000" + photo.image_url} alt={photo.caption || ""} className="w-full h-full object-cover"/>
          <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(photo.id); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>))}</div>)}
      {preview && previewIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setPreviewIdx(null)}>
          <button onClick={() => setPreviewIdx(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          {previewIdx > 0 && (<button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPreviewIdx(previewIdx - 1); }} className="absolute left-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>)}
          {previewIdx < photos.length - 1 && (<button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPreviewIdx(previewIdx + 1); }} className="absolute right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>)}
          <img src={"http://localhost:3000" + preview.image_url} alt={preview.caption || ""} className="max-w-full max-h-full object-contain" onClick={(e: React.MouseEvent) => e.stopPropagation()}/>
          {photos.length > 1 && <div className="absolute bottom-6 text-white/60 text-xs">{previewIdx + 1} / {photos.length}</div>}
        </div>
      )}
    </div>
  );
}

