"use client";

import { useState, useEffect, useRef } from "react";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
};

type MessageType = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date | string;
};

export default function ChatClient({ 
  currentUser, 
  friends,
  initialFriendId
}: { 
  currentUser: UserType; 
  friends: UserType[];
  initialFriendId?: string;
}) {
  const defaultFriend = (initialFriendId && friends.find(f => f.id === initialFriendId)) || friends[0] || null;
  const [activeFriend, setActiveFriend] = useState<UserType | null>(defaultFriend);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  // Sync if initialFriendId changes
  useEffect(() => {
    if (initialFriendId) {
      const found = friends.find(f => f.id === initialFriendId);
      if (found) setActiveFriend(found);
    }
  }, [initialFriendId, friends]);

  const fetchChat = async () => {
    if (!activeFriend || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch(`/api/messages?friendId=${activeFriend.id}`, {
        cache: "no-store"
      });
      if (res.ok) {
        const msgs = await res.json();
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      }
    } catch (err) {
      // safe
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchChat();
    // Poll every 2 seconds for real-time chat updates
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchChat();
      }
    }, 2000);

    const onFocus = () => fetchChat();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [activeFriend?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend || newMessage).trim();
    if (!text || !activeFriend) return;

    if (!contentToSend) setNewMessage("");

    // Optimistic UI update
    const optimisticMsg: MessageType = {
      id: "temp-" + Date.now(),
      senderId: currentUser.id,
      receiverId: activeFriend.id,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeFriend.id,
          content: text
        })
      });
      if (res.ok) {
        fetchChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFriends = friends.filter(f => 
    !searchFilter.trim() || (f.name && f.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="flex w-full h-[calc(100vh-56px)] bg-white dark:bg-[#18191A] select-none">
      {/* Sidebar - Contacts List */}
      <div className="w-[300px] sm:w-[360px] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-[#242526]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#050505] dark:text-[#E4E6EB]">
            ჩათები
          </h2>
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer text-sm">
            ✏️
          </div>
        </div>

        {/* Search inside Messenger */}
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-full px-3 py-1.5">
            <span className="text-gray-400 mr-2 text-sm">🔍</span>
            <input
              type="text"
              placeholder="ძიება Messenger-ში"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[#050505] dark:text-white placeholder-gray-500 w-full"
            />
          </div>
        </div>

        {/* Contacts scroll list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredFriends.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="text-3xl block mb-2">💬</span>
              <p className="text-sm font-semibold">მეგობრები არ მოიძებნა</p>
            </div>
          ) : (
            filteredFriends.map(friend => {
              const isActive = activeFriend?.id === friend.id;
              return (
                <div
                  key={friend.id}
                  onClick={() => setActiveFriend(friend)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isActive 
                      ? "bg-[#EBF5FF] dark:bg-[#3A3B3C]" 
                      : "hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C]/50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {friend.image ? (
                      <img src={friend.image} className="w-12 h-12 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-lg">
                        {friend.name?.[0] || "U"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#31A24C] border-2 border-white dark:border-[#242526] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] truncate ${isActive ? "text-[#0866FF]" : "text-[#050505] dark:text-[#E4E6EB]"}`}>
                      {friend.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      აქტიურია ახლა
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#F0F2F5] dark:bg-[#18191A] relative">
        {activeFriend ? (
          <>
            {/* Chat Top Bar */}
            <div className="p-3 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#242526] shadow-xs z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeFriend.image ? (
                    <img src={activeFriend.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold">
                      {activeFriend.name?.[0] || "U"}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#31A24C] border-2 border-white dark:border-[#242526] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[#050505] dark:text-[#E4E6EB] leading-tight">
                    {activeFriend.name}
                  </h3>
                  <p className="text-[12px] text-[#31A24C] font-semibold leading-tight">
                    აქტიურია ახლა
                  </p>
                </div>
              </div>

              {/* Call buttons */}
              <div className="flex items-center gap-2 text-[#0866FF]">
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-lg cursor-pointer" title="აუდიო ზარი">
                  📞
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-lg cursor-pointer" title="ვიდეო ზარი">
                  📹
                </button>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.length === 0 && (
                <div className="m-auto text-center py-12">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-[#0866FF]">
                    {activeFriend.image ? (
                      <img src={activeFriend.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-2xl">
                        {activeFriend.name?.[0]}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-[#050505] dark:text-[#E4E6EB]">{activeFriend.name}</h4>
                  <p className="text-gray-500 text-sm mt-1">დაიწყეთ მიმოწერა Facebook Messenger-ში</p>
                </div>
              )}

              {messages.map((msg, index) => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div 
                    key={msg.id || index} 
                    className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                        {activeFriend.image ? (
                          <img src={activeFriend.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            {activeFriend.name?.[0]}
                          </div>
                        )}
                      </div>
                    )}

                    <div 
                      className={`max-w-[70%] sm:max-w-[60%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed break-words shadow-xs ${
                        isMine 
                          ? "bg-[#0084FF] text-white rounded-br-xs" 
                          : "bg-[#E4E6EB] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] rounded-bl-xs"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <div className="p-3 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-gray-800">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }} 
                className="flex items-center gap-2"
              >
                <div className="flex-1 bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-full flex items-center px-4 py-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="ჩაწერეთ შეტყობინება..."
                    className="w-full bg-transparent border-none outline-none text-[15px] text-[#050505] dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {newMessage.trim() ? (
                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full bg-[#0866FF] hover:bg-[#0759E0] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    ➤
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSend("👍")}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xl transition-colors cursor-pointer"
                    title="მოწონება"
                  >
                    👍
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[#0866FF] flex items-center justify-center text-4xl mb-4">
              💬
            </div>
            <h3 className="text-2xl font-bold text-[#050505] dark:text-[#E4E6EB]">
              თქვენი შეტყობინებები
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-[280px]">
              აირჩიეთ მეგობარი მარცხენა სიიდან სასაუბროდ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
