import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/request.js";
import type { User } from "../utils/types.js";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try { const data = await request<User>("/api/auth/me"); setUser(data); }
      catch (err: any) { setError(err.message || "加载失败"); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, []);

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login", { replace: true }); };

  return (
    <div className="px-4 pt-4 pb-6">
      <h1 className="text-lg font-semibold text-warm-700 mb-4">我的</h1>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500 mb-3">{error}</div>}
      {loading ? (<div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-warm-100"/><div className="space-y-2 flex-1"><div className="h-4 bg-warm-100 rounded w-20"/><div className="h-3 bg-warm-50 rounded w-28"/></div></div></div>)
      : user ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-warm-200">{user.nickname.charAt(0)}</div>
            <div><p className="text-base font-semibold text-gray-900">{user.nickname}</p><p className="text-xs text-gray-400 mt-0.5">@{user.username}</p></div>
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
