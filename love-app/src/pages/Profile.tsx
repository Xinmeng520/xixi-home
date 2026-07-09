import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/request.js";
import type { User } from "../utils/types.js";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchUser = async () => {
    try {
      const data = await request<User>("/api/auth/me");
      setUser(data);
      setNickname(data.nickname);
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const handleSaveNickname = async () => {
    if (!nickname.trim()) return;
    setSaving(true);
    setSuccessMsg("");
    try {
      const updated = await request<User>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      setUser(updated);
      setEditing(false);
      setSuccessMsg("昵称更新成功");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("avatar", files[0]);
      const result = await request<{ avatar: string; user: User }>("/api/auth/avatar", {
        method: "POST",
        body: formData,
      });
      setUser(result.user);
      setSuccessMsg("头像更新成功");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err: any) {
      setError(err.message || "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login", { replace: true }); };

  return (
    <div className="px-4 pt-4 pb-6">
      <h1 className="text-lg font-semibold text-warm-700 mb-4">我的</h1>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500 mb-3">{error}</div>}
      {successMsg && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-600 mb-3">{successMsg}</div>}
      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-warm-100" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-warm-100 rounded w-20" />
              <div className="h-3 bg-warm-50 rounded w-28" />
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-warm-200 overflow-hidden ring-2 ring-white">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.nickname.charAt(0)
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              {uploading && <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUploadAvatar} />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="flex-1 px-2 py-1 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-1 focus:ring-warm-400" />
                  <button onClick={handleSaveNickname} disabled={saving} className="px-2 py-1 rounded-lg bg-warm-500 text-white text-xs">{saving ? "..." : "保存"}</button>
                  <button onClick={() => { setEditing(false); setNickname(user.nickname); }} className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-500">取消</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">{user.nickname}</p>
                  <button onClick={() => setEditing(true)} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-0.5">@{user.username}</p>
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-gray-50"><span className="text-sm text-gray-600">用户ID</span><span className="text-sm text-gray-400">#{user.id}</span></div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50"><span className="text-sm text-gray-600">用户名</span><span className="text-sm text-gray-400">{user.username}</span></div>
            <div className="flex items-center justify-between py-3"><span className="text-sm text-gray-600">昵称</span><span className="text-sm text-gray-400">{user.nickname}</span></div>
          </div>
          <button onClick={handleLogout} className="w-full mt-6 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium active:scale-[0.98] transition-transform">退出登录</button>
        </div>
      ) : null}
    </div>
  );
}
