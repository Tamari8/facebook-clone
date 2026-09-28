"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sendFriendRequest } from "@/app/actions/user";

type RequestType = {
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  }
};

export default function FriendRequests() {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleAccept = async (friendId: string) => {
    await sendFriendRequest(friendId);
    fetchRequests();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors font-bold ${isOpen ? 'bg-[#e5f0ff] text-[#0866ff] dark:bg-blue-900 dark:text-blue-200' : 'bg-[#e4e6eb] dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-[#d8dadf] dark:hover:bg-gray-600'}`}
        title="მეგობრობის მოთხოვნები"
      >
        👥
        {requests.length > 0 && !isOpen && (
           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
             {requests.length}
           </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg w-[320px] max-h-[400px] overflow-y-auto py-2 z-50">
          <h3 className="px-4 py-2 font-bold text-xl text-black dark:text-white">მეგობრობის მოთხოვნები</h3>
          <hr className="mb-2 border-gray-200 dark:border-gray-700" />
          
          {loading ? (
            <p className="text-center text-gray-500 py-4">იტვირთება...</p>
          ) : requests.length > 0 ? (
            requests.map((req) => (
              <div key={req.id} className="flex flex-col px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Link href={`/profile/${req.user.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                  {req.user.image ? (
                    <img src={req.user.image} className="w-14 h-14 rounded-full" alt="img" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                  <span className="font-semibold text-[15px] dark:text-gray-200">{req.user.name}</span>
                </Link>
                <div className="flex gap-2 mt-2 ml-17">
                  <button
                    onClick={() => handleAccept(req.user.id)}
                    className="flex-1 bg-[#0866ff] hover:bg-[#0759e0] text-white font-semibold py-1.5 rounded-md text-sm"
                  >
                    დადასტურება
                  </button>
                  <button className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-black dark:text-white font-semibold py-1.5 rounded-md text-sm">
                    წაშლა
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">ახალი მოთხოვნები არ არის</p>
          )}
        </div>
      )}
    </div>
  );
}
