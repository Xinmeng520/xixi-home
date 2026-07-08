import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", label: "首页", icon: HomeIcon },
  { path: "/album", label: "相册", icon: AlbumIcon },
  { path: "/compose", label: "", icon: AddIcon, isAdd: true },
  { path: "/anniversary", label: "纪念日", icon: CalendarIcon },
  { path: "/profile", label: "我的", icon: UserIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex justify-around items-end py-2 px-4 z-20">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        const colorClass = active ? "text-warm-500" : "text-gray-300";
        if (item.isAdd) {
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="w-10 h-10 -mt-4 bg-warm-500 rounded-full flex items-center justify-center shadow-lg shadow-warm-300/50 active:scale-95 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          );
        }
        return (
          <button key={item.path} onClick={() => navigate(item.path)} className={"flex flex-col items-center " + colorClass}>
            <item.icon />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
function HomeIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>); }
function AlbumIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>); }
function CalendarIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>); }
function UserIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>); }
function AddIcon() { return null; }
