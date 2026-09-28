"use client";

import Link from "next/link";
import { SearchIcon, MoreDotsIcon } from "./icons";

type FriendType = {
  id: string;
  name: string | null;
  image: string | null;
};

export default function RightSidebar({ friends = [] }: { friends?: FriendType[] }) {
  return (
    <aside className="hidden lg:block w-[360px] h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto px-2 py-3 scrollbar-thin hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-gray-600 select-none">
      {/* Sponsored */}
      <div className="pb-3 border-b border-gray-300 dark:border-gray-700 mx-2">
        <h4 className="text-[15px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
          სპონსორი
        </h4>
        <a 
          href="https://meta.com" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="w-[100px] h-[100px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&auto=format&fit=crop&q=80" 
              alt="Ad" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[14px] text-[#050505] dark:text-[#E4E6EB] line-clamp-2">
              Next Generation Social Platform
            </span>
            <span className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
              meta.com
            </span>
          </div>
        </a>
      </div>

      {/* Birthdays */}
      <div className="py-3 border-b border-gray-300 dark:border-gray-700 mx-2">
        <h4 className="text-[15px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
          დაბადების დღეები
        </h4>
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <span className="text-2xl">🎁</span>
          <p className="text-[14px] text-[#050505] dark:text-[#E4E6EB] leading-snug">
            <strong>ნიკა ბერიძეს</strong> და კიდევ <strong>2 სხვას</strong> დღეს დაბადების დღე აქვთ.
          </p>
        </div>
      </div>

      {/* Contacts Header */}
      <div className="pt-3 px-2 flex items-center justify-between">
        <h4 className="text-[15px] font-semibold text-gray-500 dark:text-gray-400">
          კონტაქტები
        </h4>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <button className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
            <SearchIcon className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
            <MoreDotsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-0.5 mt-1">
        {friends.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              კონტაქტები არ არის
            </p>
            <Link 
              href="/friends" 
              className="text-[13px] text-[#0866FF] hover:underline font-semibold mt-1 inline-block"
            >
              მეგობრების მოძიება
            </Link>
          </div>
        ) : (
          friends.map(friend => (
            <Link
              key={friend.id}
              href="/messages"
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                {friend.image ? (
                  <img 
                    src={friend.image} 
                    alt={friend.name || ""} 
                    className="w-9 h-9 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                    {friend.name?.[0] || "U"}
                  </div>
                )}
                {/* Active green status indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#31A24C] border-2 border-white dark:border-[#242526] rounded-full" />
              </div>
              <span className="font-semibold text-[14px] text-[#050505] dark:text-[#E4E6EB] truncate">
                {friend.name}
              </span>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
