"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessengerIcon } from "./icons";

type ConversationType = {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  lastMessage: string;
  lastMessageTime: string;
  isFromMe: boolean;
};

export default function MessengerDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
        setConversations(data.conversations || []);
      }
    } catch (e) {
      // safe
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll every 3 seconds for new incoming messages
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchConversations();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative cursor-pointer ${
          isOpen
            ? "bg-[#E7F3FF] text-[#0866FF] dark:bg-blue-900/40 dark:text-blue-400"
            : "bg-[#E4E6EB] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50]"
        }`}
        title="მესენჯერი"
      >
        <MessengerIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E41E3F] text-white text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[48px] bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl w-[360px] max-h-[500px] overflow-hidden flex flex-col z-50 animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-[22px] text-[#050505] dark:text-[#E4E6EB]">
              ჩათები
            </h3>
            <Link 
              href="/messages" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#0866FF] hover:underline cursor-pointer"
            >
              სრული ეკრანი
            </Link>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <Link
                  key={conv.user.id}
                  href={`/messages?userId=${conv.user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] transition-colors relative group"
                >
                  <div className="relative flex-shrink-0">
                    {conv.user.image ? (
                      <img
                        src={conv.user.image}
                        className="w-12 h-12 rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-lg">
                        {conv.user.name?.[0] || "U"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#31A24C] border-2 border-white dark:border-[#242526] rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-[15px] text-[#050505] dark:text-[#E4E6EB] leading-tight truncate">
                      {conv.user.name}
                    </p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {conv.isFromMe && "თქვენ: "}{conv.lastMessage || "დაიწყეთ მიმოწერა"}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <span className="text-3xl block mb-2">💬</span>
                <p className="text-sm font-semibold">შეტყობინებები არ არის</p>
                <Link 
                  href="/messages" 
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-[#0866FF] font-semibold hover:underline mt-2 inline-block"
                >
                  მესენჯერის გახსნა
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="text-[14px] font-semibold text-[#0866FF] hover:underline"
            >
              იხილეთ ყველა Messenger-ში
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
