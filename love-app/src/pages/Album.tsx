import { useEffect, useState, useCallback, useRef } from "react";
import { request } from "../utils/request.js";
import type { Photo, Album } from "../utils/types.js";

export default function Album() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumName, setAlbumName] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      const data = await request<Album[]>("/api/albums");
      setAlbums(data);
    } catch (err: any) { setError(err.message || "加载失败"); }
  }, []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedAlbum ? `/api/albums/${selectedAlbum}/photos` : "/api/photos?page=1&limit=50";
      const data = await request<any>(url);
      setPhotos(data.items || data);
    } catch (err: any) { setError(err.message || "加载失败"); }
    finally { setLoading(false); }
  }, [selectedAlbum]);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);
  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
      if (selectedAlbum) formData.append("album_id", String(selectedAlbum));
      await request("/api/photos", { method: "POST", body: formData });
      fetchPhotos();
      fetchAlbums();
    } catch (err: any) { setError(err.message || "上传失败"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleDelete = async (id: number) => {
    try {
      await request("/api/photos/" + id, { method: "DELETE" });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      fetchAlbums();
    } catch (err: any) { setError(err.message || "删除失败"); }
  };

  const openAddAlbum = () => { setEditingAlbum(null); setAlbumName(""); setAlbumDesc(""); setShowAlbumForm(true); };
  const openEditAlbum = (a: Album) => { setEditingAlbum(a); setAlbumName(a.name); setAlbumDesc(a.description || ""); setShowAlbumForm(true); };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    setSubmitting(true);
    try {
      const body = JSON.stringify({ name: albumName.trim(), description: albumDesc.trim() || undefined });
      if (editingAlbum) {
        await request("/api/albums/" + editingAlbum.id, { method: "PUT", body });
      } else {
        await request("/api/albums", { method: "POST", body });
      }
      setShowAlbumForm(false);
      fetchAlbums();
    } catch (err: any) { setError(err.message || "保存失败"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm("确定要删除这个相册吗？相册内的照片不会被删除。")) return;
    try {
      await request("/api/albums/" + id, { method: "DELETE" });
      if (selectedAlbum === id) setSelectedAlbum(null);
      fetchAlbums();
    } catch (err: any) { setError(err.message || "删除失败"); }
  };

  const preview = previewIdx !== null ? photos[previewIdx] : null;

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-warm-700">相册</h1>
        <div className="flex items-center gap-2">
          <button onClick={openAddAlbum} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-warm-100 text-warm-600 text-xs font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新建相册
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-500 text-white text-xs font-medium shadow-md shadow-warm-200 active:scale-95 transition-transform disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            上传
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleUpload} />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500 mb-3">{error}</div>}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedAlbum(null)}
          className={"shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors " + (selectedAlbum === null ? "bg-warm-500 text-white shadow-md shadow-warm-200" : "bg-white text-warm-600 border border-warm-200")}
        >
          全部
        </button>
        {albums.map((album) => (
          <div key={album.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSelectedAlbum(album.id)}
              className={"px-4 py-2 rounded-full text-xs font-medium transition-colors " + (selectedAlbum === album.id ? "bg-warm-500 text-white shadow-md shadow-warm-200" : "bg-white text-warm-600 border border-warm-200")}
            >
              {album.name}
            </button>
            <button onClick={() => openEditAlbum(album)} className="w-6 h-6 rounded-full flex items-center justify-center text-warm-400 hover:bg-warm-50">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-1.5">{[1,2,3,4,5,6].map((i) => (<div key={i} className="aspect-square rounded-xl bg-warm-100 animate-pulse"/>))}</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5" className="mx-auto mb-3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p className="text-sm text-gray-400">还没有照片</p><p className="text-xs text-gray-300 mt-1">点击上传添加照片</p></div>
      ) : (<div className="grid grid-cols-3 gap-1.5">{photos.map((photo: any, idx: number) => (
        <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-warm-100 cursor-pointer active:opacity-80 transition-opacity relative group" onClick={() => setPreviewIdx(idx)}>
          <img src={photo.image_url} alt={photo.caption || ""} className="w-full h-full object-cover"/>
          <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(photo.id); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>))}</div>)}
      {preview && previewIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setPreviewIdx(null)}>
          <button onClick={() => setPreviewIdx(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          {previewIdx > 0 && (<button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPreviewIdx(previewIdx - 1); }} className="absolute left-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>)}
          {previewIdx < photos.length - 1 && (<button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPreviewIdx(previewIdx + 1); }} className="absolute right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>)}
          <img src={preview.image_url} alt={preview.caption || ""} className="max-w-full max-h-full object-contain" onClick={(e: React.MouseEvent) => e.stopPropagation()}/>
          {photos.length > 1 && <div className="absolute bottom-6 text-white/60 text-xs">{previewIdx + 1} / {photos.length}</div>}
        </div>
      )}

      {showAlbumForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowAlbumForm(false)}>
          <div className="w-full max-w-[390px] bg-white rounded-t-3xl p-6 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
            <h2 className="text-base font-semibold text-gray-900 mb-4">{editingAlbum ? "编辑相册" : "新建相册"}</h2>
            <form onSubmit={handleAlbumSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-warm-500 mb-1.5">名称</label>
                <input type="text" value={albumName} onChange={(e) => setAlbumName(e.target.value)} placeholder="如：第一次旅行" className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"/>
              </div>
              <div>
                <label className="block text-xs text-warm-500 mb-1.5">描述（可选）</label>
                <input type="text" value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} placeholder="记录这段时光..." className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"/>
              </div>
              <div className="flex gap-3 pt-2">
                {editingAlbum && <button type="button" onClick={() => { handleDeleteAlbum(editingAlbum.id); }} className="px-4 py-3 rounded-xl border border-red-200 text-sm text-red-500">删除</button>}
                <button type="button" onClick={() => setShowAlbumForm(false)} className="flex-1 py-3 rounded-xl border border-warm-200 text-sm text-warm-500">取消</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-warm-500 text-white text-sm font-medium shadow-md disabled:opacity-50">{submitting ? "保存中..." : "保存"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
