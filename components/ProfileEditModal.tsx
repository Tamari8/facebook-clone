"use client";

import { useState, useRef } from "react";
import { updateProfile, deleteProfilePhoto, deleteCoverPhoto } from "@/app/actions/user";
import { compressImage } from "@/lib/imageUtils";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
  coverImage?: string | null;
  bio?: string | null;
};

export default function ProfileEditModal({ currentUser }: { currentUser: UserType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentUser.image || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(currentUser.coverImage || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setRemoveCover(false);
    }
  };

  const handleRemoveProfilePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleRemoveCoverPhoto = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("bio", bio);

    if (removeImage) {
      formData.append("removeImage", "true");
    } else if (imageFile) {
      const compressedImage = await compressImage(imageFile, 800);
      formData.append("image", compressedImage);
    }

    if (removeCover) {
      formData.append("removeCover", "true");
    } else if (coverFile) {
      const compressedCover = await compressImage(coverFile, 1200);
      formData.append("coverImage", compressedCover);
    }

    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      setIsOpen(false);
      window.location.reload();
    } else {
      alert(result.message || "შეცდომა პროფილის განახლებისას");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex-1 md:flex-none bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
      >
        <span>✏️</span>
        <span>პროფილის რედაქტირება</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white dark:bg-[#242526] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 text-[#050505] dark:text-[#E4E6EB]">
              პროფილის რედაქტირება
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Profile Picture Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-bold text-[#050505] dark:text-[#E4E6EB]">
                    პროფილის სურათი
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="text-sm font-semibold text-[#0866FF] hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {imagePreview ? "შეცვლა" : "დამატება"}
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePhoto}
                        className="text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        წაშლა
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-28 h-28 rounded-full border-4 border-[#0866FF] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-4xl text-gray-600 dark:text-gray-300">
                        {currentUser.name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={profileInputRef}
                  accept="image/*" 
                  onChange={handleProfileChange} 
                  className="hidden" 
                />
              </div>

              {/* 2. Cover Photo Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-bold text-[#050505] dark:text-[#E4E6EB]">
                    გარეკანის ფოტო (Cover)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="text-sm font-semibold text-[#0866FF] hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {coverPreview ? "შეცვლა" : "დამატება"}
                    </button>
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveCoverPhoto}
                        className="text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        წაშლა
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full h-36 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-700 shadow-inner bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80 font-medium text-sm">
                      გარეკანი არ არის დაყენებული
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={coverInputRef}
                  accept="image/*" 
                  onChange={handleCoverChange} 
                  className="hidden" 
                />
              </div>

              {/* 3. Bio Section */}
              <div>
                <label className="block text-base font-bold text-[#050505] dark:text-[#E4E6EB] mb-2">
                  ბიოგრაფია (Bio)
                </label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white rounded-xl p-3 outline-none focus:border-[#0866FF] resize-none text-[15px]"
                  rows={3}
                  maxLength={200}
                  placeholder="მოუყევით სხვებს თქვენს შესახებ..."
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0866FF] hover:bg-[#0759E0] text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-[15px] shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ინახება...</span>
                  </>
                ) : (
                  <span>ცვლილებების შენახვა</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
