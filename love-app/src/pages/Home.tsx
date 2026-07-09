import { useEffect, useState, useCallback } from "react";
import { request } from "../utils/request.js";
import { useNavigate } from "react-router-dom";
import type { HomeData, Post } from "../utils/types.js";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author: { id: number; nickname: string; avatar?: string };
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return mins + "分钟前";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "小时前";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + "天前";
  return (date.getMonth() + 1) + "月" + date.getDate() + "日";
}

function PostCard({ post, currentUser, onDelete, onTogglePin }: { post: Post; currentUser: number; onDelete: (id: number) => void; onTogglePin: (id: number, isPinned: number) => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [_pinning, setPinning] = useState(false);
  const navigate = useNavigate();

  const isAuthor = post.author.id === currentUser;

  const toggleLike = async () => {
    try {
      const data = await request<{ liked: boolean; like_count: number }>("/api/posts/" + post.id + "/like", { method: "POST" });
      setLiked(data.liked);
      setLikeCount(data.like_count);
    } catch (_e) { }
  };

  const loadComments = async () => {
    try {
      const data = await request<Comment[]>("/api/posts/" + post.id + "/comments");
      setComments(data);
    } catch (_e) { }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await request("/api/posts/" + post.id + "/comments", { method: "POST", body: JSON.stringify({ content: commentText.trim() }) });
      setCommentText("");
      loadComments();
    } catch (_e) { }
    finally { setCommentLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这条动态吗？")) return;
    setDeleting(true);
    try { await request("/api/posts/" + post.id, { method: "DELETE" }); onDelete(post.id); }
    catch (_e) { setDeleting(false); }
  };

  const togglePinPost = async () => {
    setPinning(true);
    try { const data = await request<{ is_pinned: number }>("/api/posts/" + post.id + "/pin", { method: "POST" }); onTogglePin(post.id, data.is_pinned); }
    catch (_e) { }
    finally { setPinning(false); }
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft relative overflow-hidden">
      {post.is_pinned === 1 && (
        <div className="absolute -top-0 -right-0 bg-gradient-to-bl from-warm-400 to-warm-500 text-white text-[9px] px-3 py-1 rounded-bl-2xl font-medium">置顶</div>
      )}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden ring-2 ring-white">
          {post.author.avatar ? (
            <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            post.author.nickname.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{post.author.nickname}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatTime(post.created_at)}</p>
        </div>
        {isAuthor && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 w-32 bg-white rounded-2xl shadow-glow border border-gray-50 z-20 overflow-hidden">
                <button onClick={() => { setShowMenu(false); navigate("/edit/" + post.id); }} className="w-full px-4 py-3 text-xs text-left text-gray-700 hover:bg-gray-50 transition-colors">编辑</button>
                <button onClick={() => { setShowMenu(false); togglePinPost(); }} className="w-full px-4 py-3 text-xs text-left text-gray-700 hover:bg-gray-50 transition-colors">{post.is_pinned === 1 ? "取消置顶" : "置顶"}</button>
                <button onClick={() => { setShowMenu(false); handleDelete(); }} className="w-full px-4 py-3 text-xs text-left text-red-500 hover:bg-red-50 transition-colors">删除</button>
              </div>
            )}
          </div>
        )}
      </div>
      {post.content && <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>}
      {post.images && post.images.length > 0 && (
        <div className={"grid gap-2 mt-3 " + (post.images.length === 1 ? "grid-cols-1" : post.images.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {post.images.slice(0, 9).map((img: any, i: number) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-warm-100">
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-50">
        <button onClick={toggleLike} className={"flex items-center gap-1.5 text-xs transition-colors " + (liked ? "text-red-500" : "text-gray-400")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>{likeCount}</span>
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>{post.comment_count}</span>
        </button>
      </div>
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-2">还没有评论</p>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <span className="text-xs font-medium text-warm-600 shrink-0">{c.author.nickname}</span>
                  <span className="text-xs text-gray-600">{c.content}</span>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={submitComment} className="flex items-center gap-2 mt-3">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="写下你的评论..." className="flex-1 px-3 py-2 rounded-xl border border-warm-100 text-xs focus:outline-none focus:border-warm-300" />
            <button type="submit" disabled={commentLoading || !commentText.trim()} className="px-3 py-2 rounded-xl bg-warm-500 text-white text-xs font-medium disabled:opacity-40">发送</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(0);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await request<HomeData>("/api/home");
      setHomeData(data);
      setPosts(data.latest_posts || []);
      const me = await request<{ id: number }>("/api/auth/me");
      setCurrentUser(me.id);
    } catch (err: any) { setError(err.message || "加载失败"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = (id: number) => { setPosts((prev) => prev.filter((p) => p.id !== id)); };
  const handleTogglePin = (id: number, isPinned: number) => { setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_pinned: isPinned } : p).sort((a, b) => b.is_pinned - a.is_pinned)); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-orange-50/20 to-warm-50">
      <div className="relative px-6 pt-12 pb-10">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-warm-100/60 via-warm-50/30 to-transparent pointer-events-none"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-lg shadow-warm-300/30 rotate-[-3deg]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-warm-700 text-xl tracking-wide" style={{ fontFamily: "Georgia, 'Songti SC', serif" }}>熙熙小窝</h1>
              <p className="text-warm-400 text-[9px] tracking-[0.3em] mt-0.5 font-light">Our Little World</p>
            </div>
          </div>

          {homeData && (
            <div className="text-center">
              <div className="mb-2">
                <p className="text-[10px] text-warm-400 tracking-[0.4em] mb-4 font-light" style={{ fontFamily: "Georgia, serif" }}>Together For</p>
                <p className="text-6xl font-extralight text-warm-700 leading-none tracking-tighter" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{homeData.days_together}</p>
                <p className="text-warm-400 text-sm mt-3 tracking-widest font-light">天 · 在一起</p>
              </div>

              <div className="flex items-center gap-3 mx-16 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-warm-200 to-warm-200"></div>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-warm-300"></div>
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-warm-300 animate-ping opacity-30"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-warm-200 to-warm-200"></div>
              </div>

              <div>
                <p className="text-[10px] text-warm-400 tracking-[0.3em] mb-3 font-light" style={{ fontFamily: "Georgia, serif" }}>Next Chapter</p>
                <p className="text-warm-600 text-base font-medium tracking-wide">{homeData.next_anniversary ? homeData.next_anniversary.title : "纪念日"}</p>
                <div className="flex items-baseline justify-center gap-1.5 mt-2">
                  <p className="text-3xl font-extralight text-warm-600 leading-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{homeData.next_anniversary ? homeData.next_anniversary.days_left : 0}</p>
                  <p className="text-warm-400 text-xs font-light">天</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {error && (
          <div className="bg-red-50/80 backdrop-blur border border-red-100 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-red-400">{error}</p>
            <button onClick={() => fetchData()} className="text-xs text-warm-500 mt-1 underline">重试</button>
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i: number) => (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-soft animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-warm-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-warm-50 rounded w-20" />
                    <div className="h-2 bg-warm-50 rounded w-14" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-warm-50 rounded w-full" />
                  <div className="h-3 bg-warm-50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-soft text-center">
            <div className="w-16 h-16 rounded-full bg-warm-50 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fdba74" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <p className="text-sm text-gray-400">暂无动态</p>
            <p className="text-xs text-gray-300 mt-1">发第一条动态记录美好吧</p>
          </div>
        ) : (
          posts.map((post: Post) => <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDelete} onTogglePin={handleTogglePin} />)
        )}
      </div>
    </div>
  );
}
