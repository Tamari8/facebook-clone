"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
  bio?: string | null;
};

export default function ProfileEditModal({ currentUser }: { currentUser: UserType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("bio", bio);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await updateProfile(formData);
    if (result.success) {
      setIsOpen(false);
      window.location.reload();
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex-1 md:flex-none bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <span>✏️</span>
        <span>პროფილის რედაქტირება</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-3 text-[#050505] dark:text-[#E4E6EB]">
              პროფილის რედაქტირება
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  პროფილის ფოტო
                </label>
                <div className="flex items-center gap-4">
                  {(imagePreview || currentUser.image) ? (
                    <img 
                      src={imagePreview || currentUser.image || ""} 
                      className="w-16 h-16 rounded-full border-2 border-[#0866FF] object-cover" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-xl">
                      {currentUser.name?.[0] || "U"}
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0866FF]/10 file:text-[#0866FF] hover:file:bg-[#0866FF]/20 cursor-pointer" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ბიოგრაფია (Bio)
                </label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white rounded-xl p-3 outline-none focus:border-[#0866FF] resize-none text-[15px]"
                  rows={3}
                  placeholder="მოუყევით სხვებს თქვენს შესახებ..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0866FF] hover:bg-[#0759E0] text-white font-bold py-2.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-[15px]"
              >
                {loading ? "ინახება..." : "შენახვა"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
