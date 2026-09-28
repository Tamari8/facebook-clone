"use client";

import { useState } from "react";
import Link from "next/link";
import { sendFriendRequest, removeFriend } from "@/app/actions/user";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
};

type RequestType = {
  id: string;
  user: UserType;
};

export default function FriendsClient({
  currentUser,
  initialRequests,
  initialFriends = [],
  initialSuggestions
}: {
  currentUser: UserType;
  initialRequests: RequestType[];
  initialFriends?: UserType[];
  initialSuggestions: UserType[];
}) {
  const [requests, setRequests] = useState<RequestType[]>(initialRequests);
  const [friends, setFriends] = useState<UserType[]>(initialFriends);
  const [suggestions, setSuggestions] = useState<UserType[]>(initialSuggestions);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "REQUESTS" | "SUGGESTIONS">("ALL");

  const handleAccept = async (reqUser: UserType) => {
    setRequests(prev => prev.filter(r => r.user.id !== reqUser.id));
    setFriends(prev => [reqUser, ...prev]);
    try {
      await sendFriendRequest(reqUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (friendId: string) => {
    setRequests(prev => prev.filter(r => r.user.id !== friendId));
    try {
      await removeFriend(friendId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("ნამდვილად გსურთ მეგობრებიდან წაშლა?")) return;
    setFriends(prev => prev.filter(f => f.id !== friendId));
    try {
      await removeFriend(friendId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFriend = async (userId: string) => {
    setSentRequestIds(prev => [...prev, userId]);
    try {
      await sendFriendRequest(userId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-56px)] select-none">
      {/* Left Sidebar */}
      <div className="hidden md:block w-[340px] bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 p-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#050505] dark:text-[#E4E6EB]">
          მეგობრები
        </h2>
        <div className="space-y-1">
          <div 
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center justify-between p-3 rounded-xl font-semibold cursor-pointer transition-colors ${
              activeTab === "ALL" 
                ? "bg-[#EBF5FF] text-[#0866FF] dark:bg-[#3A3B3C]" 
                : "hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <span>ყველა მეგობარი</span>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {friends.length}
            </span>
          </div>

          <div 
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex items-center justify-between p-3 rounded-xl font-semibold cursor-pointer transition-colors ${
              activeTab === "REQUESTS" 
                ? "bg-[#EBF5FF] text-[#0866FF] dark:bg-[#3A3B3C]" 
                : "hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🤝</span>
              <span>მოთხოვნები</span>
            </div>
            {requests.length > 0 && (
              <span className="text-xs bg-[#E41E3F] text-white px-2 py-0.5 rounded-full font-bold">
                {requests.length}
              </span>
            )}
          </div>

          <div 
            onClick={() => setActiveTab("SUGGESTIONS")}
            className={`flex items-center justify-between p-3 rounded-xl font-semibold cursor-pointer transition-colors ${
              activeTab === "SUGGESTIONS" 
                ? "bg-[#EBF5FF] text-[#0866FF] dark:bg-[#3A3B3C]" 
                : "hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <span>შემოთავაზებები</span>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {suggestions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* 1. FRIEND REQUESTS */}
        {(activeTab === "ALL" || activeTab === "REQUESTS") && requests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">
                მეგობრობის მოთხოვნები ({requests.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {requests.map(req => (
                <div 
                  key={req.id}
                  className="bg-white dark:bg-[#242526] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between"
                >
                  <Link href={`/profile/${req.user.id}`} className="block relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {req.user.image ? (
                      <img src={req.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-gray-400">
                        {req.user.name?.[0]}
                      </div>
                    )}
                  </Link>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <Link 
                        href={`/profile/${req.user.id}`}
                        className="font-bold text-[15px] hover:underline truncate block text-[#050505] dark:text-[#E4E6EB]"
                      >
                        {req.user.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">გამოგიგზავნათ მოთხოვნა</p>
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <button
                        onClick={() => handleAccept(req.user)}
                        className="w-full bg-[#0866FF] hover:bg-[#0759E0] text-white font-semibold py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        დადასტურება
                      </button>
                      <button
                        onClick={() => handleReject(req.user.id)}
                        className="w-full bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] font-semibold py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        წაშლა
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ACCEPTED FRIENDS LIST */}
        {(activeTab === "ALL" || activeTab === "REQUESTS") && friends.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">
                ჩემი მეგობრები ({friends.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {friends.map(friend => (
                <div 
                  key={friend.id}
                  className="bg-white dark:bg-[#242526] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between"
                >
                  <Link href={`/profile/${friend.id}`} className="block relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {friend.image ? (
                      <img src={friend.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-gray-400">
                        {friend.name?.[0]}
                      </div>
                    )}
                  </Link>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <Link 
                        href={`/profile/${friend.id}`}
                        className="font-bold text-[15px] hover:underline truncate block text-[#050505] dark:text-[#E4E6EB]"
                      >
                        {friend.name}
                      </Link>
                      <p className="text-xs text-[#31A24C] font-semibold mt-0.5">● მეგობარი</p>
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <Link
                        href={`/messages?userId=${friend.id}`}
                        className="w-full bg-[#0866FF] hover:bg-[#0759E0] text-white font-semibold py-1.5 rounded-lg text-sm transition-colors text-center block"
                      >
                        💬 მესიჯი
                      </Link>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="w-full bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 font-semibold py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        მეგობრებიდან წაშლა
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SUGGESTIONS */}
        {(activeTab === "ALL" || activeTab === "SUGGESTIONS") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">
                ხალხი, რომელსაც შესაძლოა იცნობდეთ
              </h3>
            </div>

            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-sm">რეკომენდაციები არ არის</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {suggestions.map(user => {
                  const isSent = sentRequestIds.includes(user.id);
                  return (
                    <div 
                      key={user.id}
                      className="bg-white dark:bg-[#242526] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between"
                    >
                      <Link href={`/profile/${user.id}`} className="block relative aspect-square bg-gray-100 dark:bg-gray-800">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-gray-400">
                            {user.name?.[0]}
                          </div>
                        )}
                      </Link>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <Link 
                            href={`/profile/${user.id}`}
                            className="font-bold text-[15px] hover:underline truncate block text-[#050505] dark:text-[#E4E6EB]"
                          >
                            {user.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">რეკომენდებული</p>
                        </div>

                        <div className="mt-3">
                          <button
                            onClick={() => handleAddFriend(user.id)}
                            disabled={isSent}
                            className={`w-full font-semibold py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                              isSent 
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default"
                                : "bg-[#0866FF]/10 text-[#0866FF] hover:bg-[#0866FF]/20 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {isSent ? "✓ მოთხოვნილია" : "+ დამატება"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
