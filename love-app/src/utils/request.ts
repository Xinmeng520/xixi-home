const API_BASE = "";

export async function request<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (token) headers["Authorization"] = "Bearer " + token;
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(API_BASE + url, { ...options, headers });
  const data = await res.json();
  if (data.code === 401) { localStorage.removeItem("token"); window.location.href = "/login"; throw new Error("Unauthorized"); }
  if (data.code !== 0) throw new Error(data.data?.message || data.message || "Request failed");
  return data.data as T;
}
