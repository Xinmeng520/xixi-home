import { useState } from 'react';

function HeaderG() {
  const [days] = useState(46);
  const [nextEvent] = useState({ name: '第一次旅行', daysLeft: 54 });

  return (
    <div className="relative bg-gradient-to-b from-orange-100 via-warm-50 to-white px-4 pt-12 pb-8 overflow-hidden">
      <svg className="absolute top-4 right-6 w-8 h-8 text-warm-200 opacity-70" viewBox="0 0 30 30" fill="currentColor"><circle cx="15" cy="15" r="3"/><circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>
      <svg className="absolute top-16 left-6 w-4 h-4 text-pink-300 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <svg className="absolute top-28 right-14 w-3 h-3 text-warm-300 opacity-40" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-md shadow-warm-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div>
            <p className="text-warm-700 font-semibold text-sm leading-none">熙熙小窝</p>
            <p className="text-warm-400 text-[9px] mt-0.5">我们的秘密基地</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative mx-auto" style={{ width: 280, height: 170 }}>
          <svg className="absolute inset-0" viewBox="0 0 280 170" fill="none">
            <ellipse cx="140" cy="150" rx="130" ry="130" stroke="#fed7aa" strokeWidth="1" opacity="0.5"/>
            <ellipse cx="140" cy="150" rx="100" ry="100" stroke="#fdba74" strokeWidth="1" opacity="0.35" strokeDasharray="4 4"/>
          </svg>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
            <div className="bg-white rounded-full shadow-sm px-3 py-1 inline-block">
              <span className="text-[10px] text-warm-400">since 2026.05.23</span>
            </div>
          </div>

          <div className="absolute left-0 top-0 bg-white rounded-2xl shadow-sm p-3 w-28 text-center border border-warm-100/50">
            <p className="text-[10px] text-warm-400 mb-0.5">在一起</p>
            <p className="text-2xl font-bold text-warm-600">{days}<span className="text-xs font-normal text-warm-400 ml-0.5">天</span></p>
          </div>

          <div className="absolute right-0 top-0 bg-white rounded-2xl shadow-sm p-3 w-28 text-center border border-warm-100/50">
            <p className="text-[10px] text-warm-400 mb-0.5">{nextEvent.name}</p>
            <p className="text-2xl font-bold text-warm-600">{nextEvent.daysLeft}<span className="text-xs font-normal text-warm-400 ml-0.5">天</span></p>
            <p className="text-[9px] text-warm-300 mt-0.5">倒计时</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoB_Full() {
  const posts = [
    { id: 1, user: '熙熙', avatar: 'X', text: '今天一起去吃了超好吃的火锅！排队等了一个小时但真的值得！', images: 9, time: '2小时前', comments: 3, likes: 12, pinned: true },
    { id: 2, user: '妈妈', avatar: 'M', text: '今天天气超级好出门拍了好多照片每一张都好喜欢', images: 4, time: '昨天', comments: 5, likes: 8, pinned: false },
    { id: 3, user: '熙熙', avatar: 'X', text: '百米冲刺更新了一百天还有五十四天我们一起加油', images: 0, time: '3天前', comments: 2, likes: 6, pinned: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-20 font-sans">
      <HeaderG />

      <div className="px-4 -mt-2 space-y-3">
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
