import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/request.js";

export default function PostCompose() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) { setError("请输入内容或上传图片"); return; }
    setSubmitting(true); setError("");
    try {
      const formData = new FormData();
      if (title.trim()) formData.append("title", title);
      formData.append("content", content);
      for (const file of files) formData.append("images", file);
      await request("/api/posts", { method: "POST", body: formData });
      navigate("/", { replace: true });
    } catch (err: any) { setError(err.message || "发布失败"); setSubmitting(false); }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 9));
  };

  const removeFile = (idx: number) => { setFiles((prev) => prev.filter((_: File, i: number) => i !== idx)); };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-warm-500">取消</button>
        <h1 className="text-base font-semibold text-gray-900">发布动态</h1>
        <button onClick={(e: React.MouseEvent) => { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }} disabled={submitting} className={"text-sm font-medium text-warm-500 " + (submitting ? "opacity-50" : "")}>{submitting ? "发布中..." : "发布"}</button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题（可选）" className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"/>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="分享你的心情..." rows={5} className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 resize-none"/>
        <div className="grid grid-cols-3 gap-2">
          {files.map((file: File, i: number) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden relative bg-warm-100">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover"/>
              <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
          {files.length < 9 && (
            <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-warm-200 flex flex-col items-center justify-center text-warm-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span className="text-[10px] mt-1">添加图片</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles}/>
      </form>
    </div>
  );
}
