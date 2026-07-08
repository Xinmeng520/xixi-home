import { useState } from 'react';

export default function DemoB() {
  const [days] = useState(46);
  const [nextEvent] = useState({ name: '在一起100天', daysLeft: 54 });

  const posts = [
    { id: 1, user: '熙熙', avatar: 'X', text: '今天一起去吃了超好吃的火锅！排队等了一个小时但真的值得！', images: 9, time: '2小时前', comments: 3, likes: 12, pinned: true },
    { id: 2, user: '妈妈', avatar: 'M', text: '今天天气超级好出门拍了好多照片每一张都好喜欢', images: 4, time: '昨天', comments: 5, likes: 8, pinned: false },
    { id: 3, user: '熙熙', avatar: 'X', text: '纪念日倒计时更新了距离一百天还有五十四天我们一起加油', images: 0, time: '3天前', comments: 2, likes: 6, pinned: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-20 font-sans">
      <div className="bg-warm-500 px-5 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-white text-lg font-semibold">我们的空间</h1>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/15 rounded-2xl p-3">
          <div className="text-white">
            <p className="text-xs opacity-80">我们在一起</p>
            <p className="text-2xl font-bold">{days} 天</p>
          </div>
          <div className="flex-1 h-px bg-white/20"></div>
          <div className="text-white text-right">
            <p className="text-xs opacity-80">距离 {nextEvent.name}</p>
            <p className="text-2xl font-bold">{nextEvent.daysLeft} 天</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm relative">
            {post.pinned && (
              <div className="absolute -top-2 left-4 bg-warm-500 text-white text-[10px] px-2 py-0.5 rounded-full">置顶</div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center text-white font-medium">{post.avatar}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{post.user}</p>
                <p className="text-[11px] text-gray-400">{post.time}</p>
              </div>
              <button className="text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
            <p className="text-sm text-gray-800 mt-3 leading-relaxed">{post.text}</p>
            {post.images > 0 && (
              <div className={"grid gap-1.5 mt-3 " + (post.images === 1 ? 'grid-cols-1' : 'grid-cols-3')}>
                {Array.from({ length: Math.min(post.images, 9) }).map((_, i) => (
                  <div key={i} className={"rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 " + (post.images === 1 ? 'aspect-[4/3]' : 'aspect-square')}>
                    {i === 8 && post.images > 9 && (
                      <div className="w-full h-full flex items-center justify-center rounded-xl bg-warm-300/50">
                        <span className="text-sm text-warm-700 font-medium">+{post.images - 9}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-5 mt-3 pt-2">
              <button className="flex items-center gap-1 text-gray-400 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-400 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-400 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <span>分享</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex justify-around py-2 px-4 z-20">
        <div className="flex flex-col items-center text-warm-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[10px] mt-0.5">首页</span>
        </div>
        <div className="flex flex-col items-center text-gray-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span className="text-[10px] mt-0.5">相册</span>
        </div>
        <div className="w-10 h-10 -mt-4 bg-warm-500 rounded-full flex items-center justify-center shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div className="flex flex-col items-center text-gray-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span className="text-[10px] mt-0.5">纪念日</span>
        </div>
        <div className="flex flex-col items-center text-gray-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="text-[10px] mt-0.5">我的</span>
        </div>
      </div>
    </div>
  );
}
