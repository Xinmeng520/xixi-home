import { useState } from 'react';

export default function DemoC() {
  const [days] = useState(46);

  const posts = [
    { id: 1, user: '\u7199\u7199', avatar: 'X', text: '\u4ECA\u5929\u4E00\u8D77\u53BB\u5403\u4E86\u8D85\u597D\u5403\u7684\u706B\u9505\uFF01\u6392\u961F\u4E00\u4E2A\u5C0F\u65F6\u4F46\u503C\u5F97', images: 9, time: '2\u5C0F\u65F6\u524D', comments: 3, likes: 12 },
    { id: 2, user: '\u5988\u5988', avatar: 'M', text: '\u65B0\u4E70\u7684\u88D9\u5B50\u5230\u4E86\uFF0C\u989C\u8272\u597D\u6B63\u5F88\u559C\u6B22', images: 4, time: '\u6628\u5929', comments: 5, likes: 8 },
  ];

  const events = [
    { name: '\u5728\u4E00\u8D77100\u5929', date: '09.05', daysLeft: 54, color: 'from-warm-400 to-warm-500' },
    { name: '\u5979\u7684\u751F\u65E5', date: '10.12', daysLeft: 89, color: 'from-pink-300 to-pink-400' },
    { name: '\u4ED6\u7684\u751F\u65E5', date: '11.28', daysLeft: 136, color: 'from-blue-300 to-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-warm-50 max-w-[390px] mx-auto pb-24 font-sans">
      <div className="flex items-center justify-between px-5 py-2 text-xs text-warm-700">
        <span>9:41</span>
        <span>100%</span>
      </div>

      <div className="px-5 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">LX</span>
          </div>
          <div>
            <h2 className="font-semibold text-warm-900 text-base">\u7199\u7199 & \u5988\u5988</h2>
            <p className="text-xs text-warm-500">\u5728\u4E00\u8D77 {days} \u5929</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-warm-900">\u7EAA\u5FF5\u65E5\u5012\u8BA1\u65F6</h3>
          <button className="text-xs text-warm-500">\u5168\u90E8</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {events.map((ev, i) => (
            <div key={i} className={"flex-shrink-0 bg-gradient-to-br " + ev.color + " rounded-xl p-3 w-32 text-white"}>
              <p className="text-white/80 text-[10px]">{ev.date}</p>
              <p className="text-xs font-medium mt-1">{ev.name}</p>
              <p className="text-lg font-bold mt-1">{ev.daysLeft}<span className="text-[10px] font-normal"> \u5929</span></p>
            </div>
          ))}
          <div className="flex-shrink-0 w-20 rounded-xl border-2 border-dashed border-warm-300 flex items-center justify-center">
            <span className="text-warm-400 text-xs">\u6DFB\u52A0</span>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-warm-900">\u6700\u65B0\u52A8\u6001</h3>
          <button className="text-xs text-warm-500">\u5168\u90E8</button>
        </div>
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-warm-400 flex items-center justify-center text-white text-sm">{post.avatar}</div>
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
              <div className="flex items-center gap-5 mt-3 pt-2 border-t border-warm-100">
                <span className="text-warm-400 text-xs">\u559C\u6B22 {post.likes}</span>
                <span className="text-warm-400 text-xs">\u8BC4\u8BBA {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-warm-900">\u76F8\u518C\u9884\u89C8</h3>
          <button className="text-xs text-warm-500">\u5168\u90E8</button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-warm-200 to-warm-300" />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-warm-100 flex justify-around py-2.5 px-4 z-20">
        <div className="flex flex-col items-center text-warm-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span className="text-[10px] mt-1">\u6982\u89C8</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span className="text-[10px] mt-1">\u52A8\u6001</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span className="text-[10px] mt-1">\u76F8\u518C</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-[10px] mt-1">\u7EAA\u5FF5\u65E5</span>
        </div>
        <div className="flex flex-col items-center text-warm-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="text-[10px] mt-1">\u6211\u7684</span>
        </div>
      </div>
    </div>
  );
}
