"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ProfileEditModal from "./ProfileEditModal";
import CreateStoryModal from "./CreateStoryModal";
import FriendButton from "@/app/profile/[id]/FriendButton";
import { updateCoverPhoto, deleteCoverPhoto, updateProfile, deleteProfilePhoto } from "@/app/actions/user";

type ProfileUserType = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  coverImage?: string | null;
  bio?: string | null;
  createdAt: Date | string;
};

export default function ProfileHeader({
  profileUser,
  currentUser,
  isOwnProfile,
  friendshipStatus,
}: {
  profileUser: ProfileUserType;
  currentUser: any;
  isOwnProfile: boolean;
  friendshipStatus: string;
}) {
  const [coverLoading, setCoverLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverLoading(true);
    const formData = new FormData();
    formData.append("coverImage", file);

    const res = await updateCoverPhoto(formData);
    setCoverLoading(false);
    if (res.success) {
      window.location.reload();
    } else {
      alert("გარეკანის ატვირთვა ვერ მოხერხდა");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await updateProfile(formData);
    setAvatarLoading(false);
    if (res.success) {
      window.location.reload();
    } else {
      alert("პროფილის ფოტოს ატვირთვა ვერ მოხერხდა");
    }
  };

  const handleDeleteCover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("ნამდვილად გსურთ გარეკანის წაშლა?")) return;
    setCoverLoading(true);
    const res = await deleteCoverPhoto();
    setCoverLoading(false);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("ნამდვილად გსურთ პროფილის ფოტოს წაშლა?")) return;
    setAvatarLoading(true);
    const res = await deleteProfilePhoto();
    setAvatarLoading(false);
    if (res.success) {
      window.location.reload();
    }
  };

  return (
    <div className="bg-white dark:bg-[#242526] shadow-sm rounded-b-2xl overflow-hidden mb-4 border border-gray-200 dark:border-gray-800 border-t-0 select-none">
      {/* 1. Cover Photo Banner */}
      <div className="h-[220px] sm:h-[300px] md:h-[360px] w-full relative group overflow-hidden bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
        {profileUser.coverImage ? (
          <img
            src={profileUser.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-lg font-semibold">
            Facebook Cover
          </div>
        )}

        {/* Cover Action Buttons for Owner */}
        {isOwnProfile && (
          <div className="absolute right-4 bottom-4 flex items-center gap-2 z-20">
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />

            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={coverLoading}
              className="bg-white/95 dark:bg-[#242526]/95 hover:bg-white dark:hover:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              {coverLoading ? (
                <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>📷</span>
              )}
              <span>{profileUser.coverImage ? "ყდის შეცვლა" : "ყდის დამატება"}</span>
            </button>

            {profileUser.coverImage && (
              <button
                onClick={handleDeleteCover}
                disabled={coverLoading}
                className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-xl shadow-md transition-colors cursor-pointer"
                title="ყდის წაშლა"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Profile Avatar & User Details */}
      <div className="px-4 sm:px-8 relative max-w-[900px] mx-auto pb-4">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-[70px] sm:-mt-[80px] md:-mt-[60px] mb-4 gap-4 md:gap-6">
          {/* Avatar with Camera badge */}
          <div className="relative group flex-shrink-0 z-10">
            <div className="w-[140px] sm:w-[168px] h-[140px] sm:h-[168px] rounded-full border-4 border-white dark:border-[#242526] overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-md">
              {profileUser.image ? (
                <img
                  src={profileUser.image}
                  alt={profileUser.name || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-5xl text-gray-500 dark:text-gray-300">
                  {profileUser.name?.[0] || "U"}
                </div>
              )}
            </div>

            {/* Avatar Upload / Delete Buttons for Owner */}
            {isOwnProfile && (
              <>
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute right-1 bottom-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 p-2.5 rounded-full border-2 border-white dark:border-[#242526] shadow-md transition-colors cursor-pointer text-sm"
                  title="პროფილის სურათის შეცვლა"
                >
                  {avatarLoading ? (
                    <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "📷"
                  )}
                </button>

                {profileUser.image && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={avatarLoading}
                    className="absolute left-1 bottom-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full border-2 border-white dark:border-[#242526] shadow-md transition-colors cursor-pointer text-xs"
                    title="პროფილის სურათის წაშლა"
                  >
                    🗑️
                  </button>
                )}
              </>
            )}
          </div>

          {/* Name & Bio */}
          <div className="text-center md:text-left flex-1 md:pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] dark:text-[#E4E6EB] leading-tight">
              {profileUser.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-0.5">
              {profileUser.email}
            </p>
            {profileUser.bio && (
              <p className="text-[#050505] dark:text-gray-200 text-[15px] mt-2 italic max-w-lg">
                "{profileUser.bio}"
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              დარეგისტრირდა: {new Date(profileUser.createdAt).toLocaleDateString("ka-GE")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto md:pb-3">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setIsStoryModalOpen(true)}
                  className="bg-[#0866FF] hover:bg-[#0759E0] text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm shadow-xs"
                >
                  <span className="text-base">+</span>
                  <span>ისტორიაში დამატება</span>
                </button>
                <ProfileEditModal currentUser={profileUser as any} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <FriendButton profileId={profileUser.id} initialStatus={friendshipStatus} />
                <Link
                  href={`/messages?userId=${profileUser.id}`}
                  className="bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors text-sm cursor-pointer"
                >
                  💬 მესიჯი
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <hr className="border-gray-200 dark:border-gray-700 mt-2" />
        <div className="flex justify-between mt-1">
          <div className="flex space-x-1">
            <div className="text-[#0866FF] border-b-4 border-[#0866FF] px-4 py-3 cursor-pointer font-bold text-sm rounded-t-lg">
              პოსტები
            </div>
            <div className="text-gray-500 dark:text-gray-400 px-4 py-3 cursor-pointer font-semibold text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              შესახებ
            </div>
            <div className="text-gray-500 dark:text-gray-400 px-4 py-3 cursor-pointer font-semibold text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              მეგობრები
            </div>
            <div className="text-gray-500 dark:text-gray-400 px-4 py-3 cursor-pointer font-semibold text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              ფოტოები
            </div>
          </div>
        </div>
      </div>

      {/* Story Create Modal */}
      {isStoryModalOpen && (
        <CreateStoryModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
