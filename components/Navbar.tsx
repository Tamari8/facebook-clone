"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/app/providers";
import { searchUsers } from "@/app/actions/user";
import NotificationsDropdown from "./NotificationsDropdown";
import MessengerDropdown from "./MessengerDropdown";
import { 
  FacebookLogo, 
  HomeIcon, 
  VideoIcon, 
  MarketplaceIcon, 
  GroupsIcon, 
  GamingIcon, 
  MenuGridIcon, 
  MessengerIcon, 
  SearchIcon 
} from "./icons";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
};

export default function Navbar({ currentUser }: { currentUser: UserType }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results as UserType[]);
        } catch (err) {
          console.error(err);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const isDark = mounted && theme === "dark";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white dark:bg-[#242526] px-4 h-[56px] shadow-sm border-b border-gray-200 dark:border-gray-800 select-none">
      {/* LEFT: Facebook Logo & Search */}
      <div className="flex items-center gap-2 relative" ref={searchRef}>
        <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-95 transition-opacity">
          <FacebookLogo className="w-10 h-10" />
        </Link>

        {/* Search Input Pill */}
        <div className="relative">
          <div className="flex items-center bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-full px-3 py-2 h-10 w-10 sm:w-[240px] transition-all">
            <SearchIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 sm:mr-2" />
            <input 
              type="text" 
              placeholder="ძიება Facebook-ზე" 
              value={searchQuery}
              onFocus={() => setShowSearchBox(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchBox(true);
              }}
              className="hidden sm:block bg-transparent border-none outline-none text-[15px] text-[#050505] dark:text-[#E4E6EB] placeholder-gray-500 dark:placeholder-gray-400 w-full font-normal" 
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchBox && searchQuery.trim().length > 0 && (
            <div className="absolute top-[48px] left-0 bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl w-[320px] max-h-[420px] overflow-y-auto py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                ძიების შედეგები
              </div>
              {isSearching ? (
                <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                  <div className="w-5 h-5 border-2 border-[#0866FF] border-t-transparent rounded-full animate-spin mr-2" />
                  იძებნება...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <Link 
                    href={`/profile/${user.id}`} 
                    key={user.id}
                    onClick={() => {
                      setShowSearchBox(false);
                      setSearchQuery("");
                    }} 
                    className="flex items-center gap-3 px-3 py-2 mx-1.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] transition-colors cursor-pointer"
                  >
                    {user.image ? (
                      <img src={user.image} className="w-9 h-9 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-bold text-sm text-gray-700 dark:text-gray-200">
                        {user.name?.[0] || "U"}
                      </div>
                    )}
                    <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB] truncate">
                      {user.name}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                  მომხმარებელი ვერ მოიძებნა
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CENTER: 5 Navigation Tabs (Desktop) */}
      <div className="hidden md:flex flex-1 justify-center max-w-[620px] h-full px-2 gap-1 lg:gap-2">
        {/* Home */}
        <Link 
          href="/" 
          className={`flex-1 max-w-[110px] h-full flex items-center justify-center relative group cursor-pointer transition-colors ${
            pathname === "/" ? "text-[#0866FF]" : "text-gray-500 dark:text-gray-400 hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] rounded-xl"
          }`}
          title="მთავარი"
        >
          <HomeIcon className="w-7 h-7" filled={pathname === "/"} />
          {pathname === "/" && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0866FF] rounded-t-full" />
          )}
        </Link>

        {/* Video / Watch */}
        <div 
          className="flex-1 max-w-[110px] h-full flex items-center justify-center relative text-gray-500 dark:text-gray-400 hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] rounded-xl cursor-pointer transition-colors"
          title="ვიდეო"
        >
          <VideoIcon className="w-7 h-7" />
        </div>

        {/* Marketplace */}
        <div 
          className="flex-1 max-w-[110px] h-full flex items-center justify-center relative text-gray-500 dark:text-gray-400 hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] rounded-xl cursor-pointer transition-colors"
          title="Marketplace"
        >
          <MarketplaceIcon className="w-7 h-7" />
        </div>

        {/* Groups */}
        <div 
          className="flex-1 max-w-[110px] h-full flex items-center justify-center relative text-gray-500 dark:text-gray-400 hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] rounded-xl cursor-pointer transition-colors"
          title="ჯგუფები"
        >
          <GroupsIcon className="w-7 h-7" />
        </div>

        {/* Gaming */}
        <div 
          className="flex-1 max-w-[110px] h-full flex items-center justify-center relative text-gray-500 dark:text-gray-400 hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] rounded-xl cursor-pointer transition-colors"
          title="თამაშები"
        >
          <GamingIcon className="w-7 h-7" />
        </div>
      </div>

      {/* RIGHT: Menu, Messenger, Notifications, Account Avatar */}
      <div className="flex items-center space-x-2 h-full">
        {/* Menu (9 dots) */}
        <button 
          className="hidden sm:flex w-10 h-10 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] items-center justify-center text-[#050505] dark:text-[#E4E6EB] transition-colors cursor-pointer"
          title="მენიუ"
        >
          <MenuGridIcon className="w-5 h-5" />
        </button>

        {/* Messenger Dropdown with live badge */}
        <MessengerDropdown />

        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        {/* User Account Avatar Button & Menu */}
        <div className="relative" ref={accountMenuRef}>
          <button 
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-10 h-10 rounded-full overflow-hidden hover:opacity-90 transition-opacity border border-black/10 dark:border-white/10 cursor-pointer flex items-center justify-center bg-gray-200 dark:bg-gray-700"
            title="ანგარიში"
          >
            {currentUser.image ? (
              <img src={currentUser.image} alt={currentUser.name || ""} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {currentUser.name?.[0] || "U"}
              </span>
            )}
          </button>

          {/* Facebook Account Menu Popover */}
          {showAccountMenu && (
            <div className="absolute right-0 top-[48px] bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl w-[340px] p-2 z-50 animate-in fade-in duration-150 text-[#050505] dark:text-[#E4E6EB]">
              {/* Profile Card */}
              <Link 
                href={`/profile/${currentUser.id}`}
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] transition-colors shadow-xs border border-gray-100 dark:border-gray-700/50 mb-2 cursor-pointer"
              >
                {currentUser.image ? (
                  <img src={currentUser.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-lg">
                    {currentUser.name?.[0] || "U"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-[17px] leading-tight">{currentUser.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">იხილეთ თქვენი პროფილი</span>
                </div>
              </Link>

              <hr className="border-gray-200 dark:border-gray-700 my-1" />

              {/* Dark Mode Toggle Switch */}
              <div 
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center text-lg">
                    🌙
                  </div>
                  <span className="font-semibold text-[15px]">მუქი რეჟიმი</span>
                </div>
                {/* Switch slider */}
                <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${isDark ? "bg-[#0866FF]" : "bg-gray-300"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${isDark ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>

              {/* Friends link */}
              <Link 
                href="/friends"
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center text-lg">
                  👥
                </div>
                <span className="font-semibold text-[15px]">მეგობრობის მოთხოვნები</span>
              </Link>

              {/* Sign Out */}
              <div 
                onClick={() => signOut()}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-red-600 dark:text-red-400 transition-colors cursor-pointer mt-1"
              >
                <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-lg">
                  🚪
                </div>
                <span className="font-semibold text-[15px]">გასვლა</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
