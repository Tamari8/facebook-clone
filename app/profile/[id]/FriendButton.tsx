"use client";

import { useState } from "react";
import { sendFriendRequest, removeFriend } from "@/app/actions/user"; // Need to add removeFriend

export default function FriendButton({ profileId, initialStatus }: { profileId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    if (status === "NONE" || status === "REQUEST_RECEIVED") {
      const result = await sendFriendRequest(profileId);
      if (result.success) {
        setStatus(status === "REQUEST_RECEIVED" ? "FRIENDS" : "REQUEST_SENT");
      }
    } else if (status === "FRIENDS" || status === "REQUEST_SENT") {
      if (confirm(status === "FRIENDS" ? "ნამდვილად გსურთ მეგობრებიდან წაშლა?" : "გსურთ მოთხოვნის გაუქმება?")) {
        const result = await removeFriend(profileId);
        if (result.success) {
          setStatus("NONE");
        }
      }
    }
    setLoading(false);
  };

  const getButtonText = () => {
    switch (status) {
      case "FRIENDS": return "✓ მეგობრები";
      case "REQUEST_SENT": return "მოთხოვნა გაგზავნილია";
      case "REQUEST_RECEIVED": return "დასტური";
      default: return "+ მეგობრებში დამატება";
    }
  };

  const getButtonStyle = () => {
    if (status === "NONE") return "bg-[#0866ff] hover:bg-[#0759e0] text-white";
    return "bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white";
  };

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className={`flex-1 md:flex-none font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${getButtonStyle()}`}
    >
      {loading ? "..." : getButtonText()}
    </button>
  );
}
