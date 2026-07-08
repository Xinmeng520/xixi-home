import { useState } from 'react';

export default function DemoA() {
  const [days] = useState(46);
  const [nextEvent] = useState({ name: '在一起100天', daysLeft: 54 });

  const posts = [
    { id: 1, user: '熙熙', avatar: 'X', text: '今天一起去吃了超好吃的火锅！', images: 9, time: '2小时前', comments: 3 },
    { id: 2, user: '妈妈', avatar: 'M', text: '新买的裙子到了，颜色好正', images: 4, time: '昨天', comments: 1 },
  ];

  return (
    <div className="min-h-screen bg-warm-50 max-w-[390px] mx-auto relative font-sans">
      <div className="flex items-center justify-between px-5 py-2 text-xs text-warm-700">
        <span>9:41</span>
        <span>100%</span>
      </div>

      <div className="mx-4 rounded-3xl bg-gradient-to-br from-warm-400 to-warm-600 p-6 text-white shadow-lg shadow-warm-300/30">
        <p className="text-xs opacity-80 mb-1">我们在一起</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-5xl font-bold tracking-tight">{days}</span>
          <span className="text-lg">天</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-3 mt-2">
          <span className="text-sm opacity-90">距离 {nextEvent.name}</span>
          <span className="font-semibold text-xl">{nextEvent.daysLeft} 天</span>
        </div>
      </div>

      <div className="flex items-center justify-around mt-5 mx-4 bg-white rounded-2xl py-3 shadow-sm">
        <div className="flex flex-col items-center text-warm-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
          <span className="text-[10px] mt-1">动态</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span className="text-[10px] mt-1">相册</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-[10px] mt-1">纪念日</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="text-[10px] mt-1">我的</span>
        </div>
      </div>

      <div className="mx-4 mt-4 space-y-3 pb-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-warm-400 flex items-center justify-center text-white text-sm font-medium">{post.avatar}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-warm-900">{post.user}</p>
                <p className="text-[10px] text-warm-400">{post.time}</p>
              </div>
            </div>
            <p className="text-sm text-warm-800 mt-3 leading-relaxed">{post.text}</p>
            {post.images > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {Array.from({ length: Math.min(post.images, 6) }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-warm-200 to-warm-300" />
                ))}
                {post.images > 6 && (
                  <div className="aspect-square rounded-lg bg-warm-100 flex items-center justify-center">
                    <span className="text-xs text-warm-500">+{post.images - 6}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-warm-100">
              <button className="flex items-center gap-1 text-warm-400 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>喜欢</span>
              </button>
              <button className="flex items-center gap-1 text-warm-400 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{post.comments}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="fixed bottom-8 right-6 w-14 h-14 bg-warm-500 rounded-full shadow-lg shadow-warm-400/40 flex items-center justify-center z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  );
}
