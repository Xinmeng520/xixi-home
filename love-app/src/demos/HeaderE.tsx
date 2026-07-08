import { useState } from 'react';

function HeaderE() {
  const [days] = useState(46);
  const [nextEvent] = useState({ name: '第一次旅行', daysLeft: 54 });

  return (
    <div className="relative bg-gradient-to-br from-orange-50 via-warm-50 to-amber-50 px-4 pt-12 pb-6 overflow-hidden">
      {/* Scattered hearts background */}
      <svg className="absolute top-3 left-4 w-6 h-6 text-warm-200 opacity-60" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <svg className="absolute top-8 right-8 w-4 h-4 text-warm-300 opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <svg className="absolute bottom-10 right-12 w-5 h-5 text-warm-200 opacity-30" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

      {/* Title row with heartbeat icon */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-warm-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span className="text-warm-700 text-xs font-medium tracking-wider">熙熙小窝</span>
        </div>
        <div className="absolute right-2 w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
      </div>

      {/* Main card - scrapbook style */}
      <div className="relative mx-2 bg-white rounded-3xl shadow-sm p-5">
        {/* Tape decoration */}
        <div className="absolute -top-2 left-8 w-12 h-5 bg-warm-200/60 rounded-sm"></div>
        <div className="absolute -top-2 right-10 w-10 h-5 bg-warm-100/70 rounded-sm"></div>

        <div className="absolute top-2 right-3 text-[9px] text-warm-300">since 2026.05.23</div>

        <div className="flex items-center justify-between mt-3">
          {/* Left - Together days */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
              <svg className="absolute inset-0" width="88" height="88" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb923c"/>
                    <stop offset="100%" stopColor="#f97316"/>
                  </linearGradient>
                </defs>
                <path d="M50 82 C25 62 10 48 10 32 C10 18 22 10 32 10 C40 10 47 16 50 21 C53 16 60 10 68 10 C78 10 90 18 90 32 C90 48 75 62 50 82Z" fill="url(#heartGrad)" opacity="0.2"/>
              </svg>
              <div className="relative text-center z-10">
                <p className="text-warm-500 text-[11px]">在一起</p>
                <p className="text-warm-600 text-4xl font-bold leading-tight">{days}</p>
                <p className="text-warm-400 text-[10px]">天</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex flex-col items-center mx-1">
            <div className="w-2 h-2 rounded-full bg-warm-300 mb-1"></div>
            <div className="w-px h-14 bg-gradient-to-b from-warm-300 to-warm-100"></div>
            <div className="w-2 h-2 rounded-full bg-warm-400 mt-1 animate-pulse"></div>
          </div>

          {/* Right - Next event */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
              <svg className="absolute inset-0" width="88" height="88" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="#fff7ed" stroke="#fed7aa" strokeWidth="4" strokeDasharray="8 4"/>
                <circle cx="50" cy="50" r="36" fill="none" stroke="#fdba74" strokeWidth="1" opacity="0.5"/>
              </svg>
              <div className="relative text-center z-10">
                <p className="text-warm-400 text-[10px]">距离</p>
                <p className="text-warm-600 font-medium text-xs leading-tight mt-0.5">{nextEvent.name}</p>
                <p className="text-warm-600 text-3xl font-bold leading-tight mt-1">{nextEvent.daysLeft}</p>
                <p className="text-warm-400 text-[10px]">天后</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoB_HeaderE() {
  return (
    <div className="min-h-screen bg-orange-50/50 max-w-[390px] mx-auto pb-20 font-sans">
      <HeaderE />
      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-400">[Posts will appear here]</p>
        </div>
      </div>
    </div>
  );
}
