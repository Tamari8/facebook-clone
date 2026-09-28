"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  VideoIcon, 
  GroupsIcon, 
  MarketplaceIcon, 
  BellIcon, 
  MenuGridIcon 
} from "./icons";

export default function MobileNav() {
  const pathname = usePathname();
  
  if (
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" || 
    pathname === "/reset-password"
  ) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-[54px] z-50 shadow-lg px-1 select-none">
      {/* Home */}
      <Link 
        href="/" 
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          pathname === "/" ? "text-[#0866FF]" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <HomeIcon className="w-6 h-6" filled={pathname === "/"} />
      </Link>

      {/* Video */}
      <div 
        className="flex-1 flex flex-col items-center justify-center py-1 text-gray-500 dark:text-gray-400"
      >
        <VideoIcon className="w-6 h-6" />
      </div>

      {/* Friends */}
      <Link 
        href="/friends" 
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          pathname === "/friends" ? "text-[#0866FF]" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <GroupsIcon className="w-6 h-6" />
      </Link>

      {/* Marketplace */}
      <div 
        className="flex-1 flex flex-col items-center justify-center py-1 text-gray-500 dark:text-gray-400"
      >
        <MarketplaceIcon className="w-6 h-6" />
      </div>

      {/* Notifications */}
      <Link 
        href="/messages" 
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          pathname === "/messages" ? "text-[#0866FF]" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <BellIcon className="w-6 h-6" />
      </Link>

      {/* Menu / Profile */}
      <Link 
        href="/profile" 
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          pathname.startsWith("/profile") ? "text-[#0866FF]" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <MenuGridIcon className="w-6 h-6" />
      </Link>
    </nav>
  );
}
