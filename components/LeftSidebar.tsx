"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  FriendsColoredIcon, 
  MemoriesColoredIcon, 
  SavedColoredIcon, 
  GroupsColoredIcon, 
  VideoColoredIcon 
} from "./icons";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
};

export default function LeftSidebar({ currentUser }: { currentUser: UserType }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="hidden xl:block w-[360px] h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto px-2 py-3 scrollbar-thin hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-gray-600 transition-colors select-none">
      <div className="space-y-0.5">
        {/* Profile Link */}
        <Link 
          href={`/profile/${currentUser.id}`}
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          {currentUser.image ? (
            <img src={currentUser.image} alt={currentUser.name || ""} className="w-9 h-9 rounded-full object-cover border border-black/10 dark:border-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
              {currentUser.name?.[0] || "U"}
            </div>
          )}
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB] truncate">
            {currentUser.name}
          </span>
        </Link>

        {/* Friends */}
        <Link 
          href="/friends"
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <FriendsColoredIcon className="w-9 h-9" />
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            მეგობრები
          </span>
        </Link>

        {/* Memories */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <MemoriesColoredIcon className="w-9 h-9" />
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            მოგონებები
          </span>
        </div>

        {/* Saved */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <SavedColoredIcon className="w-9 h-9" />
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            შენახული
          </span>
        </div>

        {/* Groups */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <GroupsColoredIcon className="w-9 h-9" />
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            ჯგუფები
          </span>
        </div>

        {/* Video */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <VideoColoredIcon className="w-9 h-9" />
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            ვიდეოები
          </span>
        </div>

        {showMore && (
          <>
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center text-[#1877F2]">
                🛒
              </div>
              <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
                Marketplace
              </span>
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-red-500/10 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                ⭐
              </div>
              <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
                ღონისძიებები
              </span>
            </div>
          </>
        )}

        {/* See More Toggle */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center text-black dark:text-white font-bold">
            <svg 
              viewBox="0 0 16 16" 
              fill="currentColor" 
              className={`w-4 h-4 transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}
            >
              <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            {showMore ? "ნაკლების ნახვა" : "მეტის ნახვა"}
          </span>
        </button>

        <hr className="my-2 border-gray-300 dark:border-gray-700 mx-2" />

        {/* Shortcuts */}
        <div className="px-2 pt-1 pb-2">
          <h4 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">
            თქვენი მალსახმობები
          </h4>
        </div>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            FB
          </div>
          <span className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB]">
            Facebook Developers Georgia
          </span>
        </div>

        {/* Footer */}
        <div className="px-3 pt-6 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
          <p className="hover:underline cursor-pointer inline">კონფიდენციალურობა</p> · {" "}
          <p className="hover:underline cursor-pointer inline">პირობები</p> · {" "}
          <p className="hover:underline cursor-pointer inline">რეკლამა</p> · {" "}
          <p className="hover:underline cursor-pointer inline">Cookies</p> · {" "}
          <p className="hover:underline cursor-pointer inline">მეტი</p>
          <p className="mt-2 text-gray-400 dark:text-gray-500">Meta © 2026</p>
        </div>
      </div>
    </aside>
  );
}
