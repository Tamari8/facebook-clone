"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getNotifications, markNotificationsRead } from "@/app/actions/chat";
import { BellIcon } from "./icons";

type NotificationType = {
  id: string;
  type: string;
  postId: string | null;
  read: boolean;
  createdAt: Date;
  actor: {
    name: string | null;
    image: string | null;
  };
};

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data as any);
      }
    } catch (e) {
      // Silently fail to avoid UI crash
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll gently every 5 seconds only if tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      try {
        await markNotificationsRead();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative cursor-pointer ${
          isOpen 
            ? "bg-[#E7F3FF] text-[#0866FF] dark:bg-blue-900/40 dark:text-blue-400" 
            : "bg-[#E4E6EB] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50]"
        }`}
        title="შეტყობინებები"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E41E3F] text-white text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[48px] bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl w-[360px] max-h-[480px] overflow-hidden flex flex-col z-50 animate-in fade-in duration-150">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-[22px] text-[#050505] dark:text-[#E4E6EB]">
              შეტყობინებები
            </h3>
            <span className="text-xs font-semibold text-[#0866FF] hover:underline cursor-pointer">
              ყველას წაკითხულად მონიშვნა
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                let text = "";
                let icon = "🔔";
                let link = "/";
                
                if (notif.type === "LIKE") {
                  text = "მოიწონა თქვენი პოსტი.";
                  icon = "👍";
                  link = `/?post=${notif.postId}`;
                } else if (notif.type === "COMMENT") {
                  text = "დააკომენტარა თქვენს პოსტზე.";
                  icon = "💬";
                  link = `/?post=${notif.postId}`;
                } else if (notif.type === "FRIEND_REQUEST") {
                  text = "გამოგიგზავნათ მეგობრობის მოთხოვნა.";
                  icon = "👥";
                  link = "/friends";
                } else if (notif.type === "FRIEND_ACCEPTED") {
                  text = "დაადასტურა თქვენი მეგობრობის მოთხოვნა.";
                  icon = "🤝";
                  link = `/friends`;
                }

                return (
                  <Link 
                    href={link} 
                    key={notif.id} 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] transition-colors relative group ${
                      !notif.read ? "bg-[#E7F3FF]/40 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {notif.actor.image ? (
                        <img 
                          src={notif.actor.image} 
                          className="w-12 h-12 rounded-full object-cover" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                          {notif.actor.name?.[0] || "U"}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-[#242526] rounded-full flex items-center justify-center text-xs shadow-xs">
                        {icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[14px] text-[#050505] dark:text-[#E4E6EB] leading-snug line-clamp-2">
                        <strong className="font-semibold">{notif.actor.name}</strong> {text}
                      </p>
                      <p className="text-[12px] text-[#0866FF] font-medium mt-0.5">
                        {new Date(notif.createdAt).toLocaleDateString("ka-GE")}
                      </p>
                    </div>

                    {!notif.read && (
                      <span className="w-2.5 h-2.5 bg-[#0866FF] rounded-full flex-shrink-0" />
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <span className="text-3xl block mb-2">🔔</span>
                <p className="text-sm font-semibold">ახალი შეტყობინებები არ არის</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
