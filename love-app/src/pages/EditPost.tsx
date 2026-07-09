import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../utils/request.js";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await request<any>("/api/posts/" + id);
        setTitle(post.title || "");
        setContent(post.content);
        setExistingImages((post.images || []).map((img: any) => img.image_url));
        setIsPinned(post.is_pinned === 1);
      } catch (err: any) { setError(err.message || "\u52a0\u8f7d\u5931\u8d25"); }
      finally { setLoading(false); }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("\u8bf7\u8f93\u5165\u5185\u5bb9"); return; }
    setSubmitting(true); setError("");
    try {
      const formData = new FormData();
      if (title.trim()) formData.append("title", title);
      formData.append("content", content);
      formData.append("is_pinned", isPinned ? "1" : "0");
      for (const file of newFiles) formData.append("images", file);
      for (const url of existingImages) formData.append("retainedImages", url);
      
      await request("/api/posts/" + id, { method: "PUT", body: formData });
      navigate("/", { replace: true });
    } catch (err: any) { setError(err.message || "\u66f4\u65b0\u5931\u8d25"); setSubmitting(false); }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...selected].slice(0, 9));
  };

  const removeNewFile = (idx: number) => { setNewFiles((prev) => prev.filter((_, i) => i !== idx)); };
  const removeExistingImage = (idx: number) => { setExistingImages((prev) => prev.filter((_, i) => i !== idx)); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white px-5 pt-5">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-warm-100 rounded-xl w-1/3" />
          <div className="h-40 bg-warm-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-orange-50/30 to-warm-50 px-5 pt-5 pb-28">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="text-sm text-warm-500 font-medium active:opacity-60 transition-opacity">\u53d6\u6d88</button>
        <h1 className="text-sm font-medium text-warm-600 tracking-wide">\u7f16\u8f91\u52a8\u6001</h1>
        <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 rounded-full bg-gradient-to-r from-warm-400 to-warm-500 text-white text-xs font-medium shadow-lg shadow-warm-300/30 disabled:opacity-40 active:scale-95 transition-all">
          {submitting ? "\u4fdd\u5b58\u4e2d..." : "\u4fdd\u5b58"}
        </button>
      </div>

      {error && <div className="bg-red-50/80 border border-red-100 rounded-2xl px-4 py-2.5 text-xs text-red-400 text-center mb-5">{error}</div>}

      <div className="bg-white rounded-3xl p-5 shadow-soft">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="\u6807\u9898\uff08\u53ef\u9009\uff09" className="w-full px-4 py-3 rounded-2xl border border-warm-200 text-sm text-gray-700 placeholder:text-warm-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 transition-all mb-3" />

        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="\u6b64\u523b\u7684\u60f3\u6cd5..." rows={8} className="w-full px-4 py-3 rounded-2xl border border-warm-200 text-sm text-gray-700 placeholder:text-warm-300 focus:outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 resize-none transition-all leading-relaxed" />

        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            {existingImages.map((url: string, i: number) => (
              <div key={"old-" + i} className="aspect-square rounded-2xl overflow-hidden bg-warm-100 relative group border border-warm-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {newFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            {newFiles.map((file: File, i: number) => (
              <div key={"new-" + i} className="aspect-square rounded-2xl overflow-hidden bg-warm-100 relative group border border-warm-100">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[366px]">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between shadow-glow">
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-xs text-warm-500 hover:text-warm-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span className="font-medium">\u56fe\u7247</span>
            </button>
            <button type="button" onClick={() => setIsPinned(!isPinned)} className={"flex items-center gap-2 text-xs font-medium transition-colors " + (isPinned ? "text-warm-500" : "text-warm-400 hover:text-warm-500")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span>{isPinned ? "\u5df2\u7f6e\u9876" : "\u7f6e\u9876"}</span>
            </button>
          </div>
          <p className="text-[10px] text-warm-300 font-light">{existingImages.length + newFiles.length}/9</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
    </div>
  );
}


