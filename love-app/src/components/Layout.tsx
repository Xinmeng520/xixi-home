import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav.js";

export default function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 max-w-[390px] mx-auto pb-20 relative">
      <Outlet />
      <BottomNav />
    </div>
  );
}
