import { useEffect, useState, useCallback } from "react";
import { request } from "../utils/request.js";
import type { HomeData, Post } from "../utils/types.js";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "\u521a\u521a";
  if (mins < 60) return mins + "\u5206\u949f\u524d";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "\u5c0f\u65f6\u524d";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + "\u5929\u524d";
  return (date.getMonth() + 1) + "\u6708" + date.getDate() + "\u65e5";
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const toggleLike = async () => {
    try {
      const data = await request<{ liked: boolean }>("/api/posts/" + post.id + "/like", { method: "POST" });
      setLiked(data.liked);
      setLikeCount((prev: number) => data.liked ? prev + 1 : prev - 1);
    } catch (_e) { /* silent */ }
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm relative">
      {post.is_pinned === 1 && (
        <div className="absolute -top-2 left-4 bg-warm-500 text-white text-[10px] px-2 py-0.5 rounded-full">\u7f6e\u9876</div>
      )}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white font-medium text-sm">
          {post.author.nickname.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{post.author.nickname}</p>
          <p className="text-[11px] text-gray-400">{formatTime(post.created_at)}</p>
        </div>
      </div>
      {post.title && <p className="text-sm font-semibold text-gray-900 mt-3">{post.title}</p>}
      <p className="text-sm text-gray-800 mt-1 leading-relaxed">{post.content}</p>
      {post.images && post.images.length > 0 && (
        <div className={"grid gap-1.5 mt-3 " + (post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {post.images.slice(0, 9).map((img: Post["images"][0], i: number) => (
            <div key={i} className={"rounded-xl overflow-hidden bg-warm-100 " + (post.images.length === 1 ? "aspect-[4/3]" : "aspect-square")}>
              <img src={"http://localhost:3000" + img.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-5 mt-3 pt-2">
        <button onClick={toggleLike} className={"flex items-center gap-1 text-xs transition-colors " + (liked ? "text-warm-500" : "text-gray-400")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1 text-gray-400 text-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{post.comment_count}</span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [homeRes, postsRes] = await Promise.all([
        request<HomeData>("/api/home"),
        request<{ items: Post[] }>("/api/posts?page=1&limit=20"),
      ]);
      setHomeData(homeRes);
      setPosts(postsRes.items);
    } catch (err: any) {
      setError(err.message || "\u52a0\u8f7d\u5931\u8d25");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="pb-6">
      <div className="relative bg-gradient-to-b from-orange-100 via-warm-50 to-warm-50 px-4 pt-12 pb-8 overflow-hidden">
        <svg className="absolute top-4 right-6 w-8 h-8 text-warm-200 opacity-70" viewBox="0 0 30 30" fill="currentColor"><circle cx="15" cy="15" r="3"/><circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>
        <svg className="absolute top-16 left-6 w-4 h-4 text-pink-300 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-md shadow-warm-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <div>
              <p className="text-warm-700 font-semibold text-sm leading-none">\u7199\u7199\u5c0f\u7a9d</p>
              <p className="text-warm-400 text-[9px] mt-0.5">\u6211\u4eec\u7684\u79d8\u5bc6\u57fa\u5730</p>
            </div>
          </div>
        </div>
        {homeData && (
          <div className="relative">
            <div className="relative mx-auto" style={{ width: "100%", maxWidth: 280, height: 170 }}>
              <svg className="absolute inset-0" viewBox="0 0 280 170" fill="none">
                <ellipse cx="140" cy="150" rx="130" ry="130" stroke="#fed7aa" strokeWidth="1" opacity="0.5"/>
                <ellipse cx="140" cy="150" rx="100" ry="100" stroke="#fdba74" strokeWidth="1" opacity="0.35" strokeDasharray="4 4"/>
              </svg>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
                <div className="bg-white rounded-full shadow-sm px-3 py-1 inline-block">
                  <span className="text-[10px] text-warm-400">since 2026.05.23</span>
                </div>
              </div>
              <div className="absolute left-0 top-0 bg-white rounded-2xl shadow-sm p-3 w-[112px] text-center border border-warm-100/50">
                <p className="text-[10px] text-warm-400 mb-0.5">\u5728\u4e00\u8d77</p>
                <p className="text-2xl font-bold text-warm-600">{homeData.days_together}<span className="text-xs font-normal text-warm-400 ml-0.5">\u5929</span></p>
              </div>
              <div className="absolute right-0 top-0 bg-white rounded-2xl shadow-sm p-3 w-[112px] text-center border border-warm-100/50">
                <p className="text-[10px] text-warm-400 mb-0.5">{homeData.next_anniversary ? homeData.next_anniversary.title : "\u4e0b\u4e00\u4e2a\u7eaa\u5ff5\u65e5"}</p>
                <p className="text-2xl font-bold text-warm-600">{homeData.next_anniversary ? homeData.next_anniversary.days_left : 0}<span className="text-xs font-normal text-warm-400 ml-0.5">\u5929</span></p>
                <p className="text-[9px] text-warm-300 mt-0.5">\u5012\u8ba1\u65f6</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="px-4 -mt-2 space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-red-500">{error}</p>
            <button onClick={() => fetchData()} className="text-xs text-warm-500 mt-1 underline">\u91cd\u8bd5</button>
          </div>
        )}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i: number) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warm-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-warm-100 rounded w-20" />
                    <div className="h-2 bg-warm-50 rounded w-14" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-warm-50 rounded w-full" />
                  <div className="h-3 bg-warm-50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5" className="mx-auto mb-3"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <p className="text-sm text-gray-400">\u6682\u65e0\u5e16\u5b50</p>
            <p className="text-xs text-gray-300 mt-1">\u53d1\u7b2c\u4e00\u6761\u52a8\u6001\u5427</p>
          </div>
        ) : (
          posts.map((post: Post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

