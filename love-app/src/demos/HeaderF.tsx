import { useState } from 'react';

function HeaderF() {
  const [days] = useState(46);
  const [nextEvent] = useState({ name: '第一次旅行', daysLeft: 54 });

  return (
    <div className="relative bg-gradient-to-br from-warm-500 via-warm-400 to-warm-300 px-4 pt-12 pb-10 overflow-hidden overflow-visible">
      {/* Circular decorations */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
      <div className="absolute top-20 -left-8 w-20 h-20 rounded-full bg-white/5"></div>
      <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-white/30"></div>
      <div className="absolute top-8 right-10 w-2 h-2 rounded-full bg-white/20"></div>

      {/* Top row: brand + bell */}
      <div className="relative flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <span className="text-white font-medium text-base">熙熙小窝</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
      </div>

      {/* Main content - horizontal layout with badge style */}
      <div className="relative flex items-center justify-center gap-3 px-2">
        {/* Left badge - together */}
        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative overflow-hidden">
          <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-white/10"></div>
          <p className="text-white/65 text-[10px] mb-1">在一起</p>
          <p className="text-white text-3xl font-bold leading-none">{days}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
            <span className="text-white/60 text-[10px]">天</span>
          </div>
        </div>

        {/* Center heart connector */}
        <div className="flex flex-col items-center -mx-1 z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>

        {/* Right badge - next event */}
        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative overflow-hidden">
          <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white/10"></div>
          <p className="text-white/65 text-[10px] mb-0.5">距离</p>
          <p className="text-white text-xs font-medium leading-tight">{nextEvent.name}</p>
          <p className="text-white text-3xl font-bold leading-none mt-1">{nextEvent.daysLeft}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-white/60 text-[10px]">天后</span>
          </div>
        </div>
      </div>

      {/* Bottom date line */}
      <div className="flex justify-center mt-4">
        <p className="text-white/40 text-[9px] tracking-widest">SINCE 2026.05.23</p>
      </div>

      {/* Wave SVG */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 390 35" preserveAspectRatio="none" style={{ height: 28 }}>
        <path d="M0,15 C65,30 130,5 195,15 C260,25 325,8 390,18 L390,35 L0,35 Z" fill="#fff7ed"/>
      </svg>
    </div>
  );
}

export default function DemoB_HeaderF() {
  return (
    <div className="min-h-screen bg-orange-50 max-w-[390px] mx-auto pb-20 font-sans overflow-hidden">
      <HeaderF />
      <div className="px-4 -mt-1 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-400">[Posts will appear here]</p>
        </div>
      </div>
    </div>
  );
}
