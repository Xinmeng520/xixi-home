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
    if (!username.trim() || !password.trim()) { setError("\u8bf7\u8f93\u5165\u7528\u6237\u540d\u548c\u5bc6\u7801"); return; }
    setLoading(true);
    try {
      const data = await request<{ token: string; user: { id: number; username: string; nickname: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("token", data.token);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "\u767b\u5f55\u5931\u8d25");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-warm-50 max-w-[390px] mx-auto">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-lg shadow-warm-200 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h1 className="text-xl font-bold text-warm-700 mb-1">\u767b\u5f55</h1>
          <p className="text-sm text-warm-400">\u767b\u5f55\u4f60\u7684\u8d26\u6237</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">\u7528\u6237\u540d</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="\u8bf7\u8f93\u5165\u7528\u6237\u540d"
              className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">\u5bc6\u7801</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="\u8bf7\u8f93\u5165\u5bc6\u7801"
              className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-500">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-warm-500 text-white font-medium text-sm shadow-md shadow-warm-200 active:scale-[0.98] transition-transform disabled:opacity-50">
            {loading ? "\u767b\u5f55\u4e2d..." : "\u767b \u5f55"}
          </button>
        </form>
        <p className="text-center text-[11px] text-warm-300 mt-6">\u9ed8\u8ba4\u8d26\u53f7: xixi / 123456</p>
      </div>
    </div>
  );
}
