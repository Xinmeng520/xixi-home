import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/request.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) { setError("请输入用户名和密码"); return; }
    setLoading(true);
    try {
      const data = await request<{ token: string; user: { id: number; username: string; nickname: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("token", data.token);
      navigate("/", { replace: true });
    } catch (err: any) { setError(err.message || "登录失败"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-gradient-to-br from-warm-50 via-orange-50 to-pink-50 max-w-[390px] mx-auto relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] right-[-30%] w-[70%] h-[70%] bg-gradient-to-bl from-warm-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-gradient-to-tr from-pink-100/30 to-transparent rounded-full blur-2xl"></div>

      <div className="w-full max-w-xs relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-glow mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h1 className="text-2xl font-semibold text-warm-700 tracking-wide">熙熙小窝</h1>
          <p className="text-sm text-warm-400 mt-1.5 tracking-wider">登录你的小世界</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-warm-500 mb-2 font-medium">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名"
              className="w-full px-4 py-3.5 rounded-2xl border border-warm-200 bg-white/80 backdrop-blur text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent shadow-sm" />
          </div>
          <div>
            <label className="block text-xs text-warm-500 mb-2 font-medium">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码"
              className="w-full px-4 py-3.5 rounded-2xl border border-warm-200 bg-white/80 backdrop-blur text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent shadow-sm" />
          </div>
          {error && <div className="bg-red-50/80 border border-red-100 rounded-2xl px-4 py-2.5 text-xs text-red-400 text-center">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-warm-400 to-warm-500 text-white font-medium text-sm shadow-lg shadow-warm-300/30 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "登录中..." : "登 录"}
          </button>
        </form>
        <p className="text-center text-[11px] text-warm-300 mt-8">默认账号: xixi / 123456</p>
      </div>
    </div>
  );
}