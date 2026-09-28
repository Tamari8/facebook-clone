"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createPost } from "@/app/actions/post";
import { compressImage } from "@/lib/imageUtils";
import { 
  LiveVideoIcon, 
  PhotoVideoIcon, 
  FeelingSmileIcon, 
  GlobeIcon 
} from "./icons";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
};

export default function CreatePostBox({ 
  currentUser, 
  onPostCreated 
}: { 
  currentUser: UserType; 
  onPostCreated?: (newPost: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const FEELINGS = [
    { emoji: "😊", label: "ბედნიერად" },
    { emoji: "🥳", label: "ზეიმობს" },
    { emoji: "😴", label: "დაღლილად" },
    { emoji: "😎", label: "თავდაჯერებულად" },
    { emoji: "🔥", label: "მოტივირებულად" },
    { emoji: "☕", label: "ისვენებს" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsOpen(true);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setLoading(true);
    const postContent = feeling ? `${content}\n\n— ${feeling}` : content;
    const formData = new FormData();
    formData.append("content", postContent);
    if (imageFile) {
      const compressedImage = await compressImage(imageFile, 1200);
      formData.append("image", compressedImage);
    }

    // Call server action
    const res = await createPost(formData);
    if (res.success) {
      if (onPostCreated) {
        onPostCreated({
          id: "temp-" + Date.now(),
          content: postContent,
          imageUrl: imagePreview,
          createdAt: new Date(),
          author: currentUser,
          likes: [],
          comments: []
        });
      }
      // Reset form
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setFeeling(null);
      setIsOpen(false);
    } else {
      alert(res.message || "შეცდომა პოსტის გამოქვეყნებისას");
    }
    setLoading(false);
  };

  const firstName = currentUser.name?.split(" ")[0] || "მომხმარებელო";

  return (
    <>
      {/* Feed Card */}
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 mb-4 select-none">
        <div className="flex items-center gap-2 pb-3">
          <Link href={`/profile/${currentUser.id}`} className="flex-shrink-0 cursor-pointer">
            {currentUser.image ? (
              <img 
                src={currentUser.image} 
                alt={currentUser.name || ""} 
                className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                {currentUser.name?.[0] || "U"}
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 bg-[#F0F2F5] dark:bg-[#3A3B3C] hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] rounded-full px-4 py-2.5 text-left text-gray-500 dark:text-gray-400 text-[15px] sm:text-[17px] transition-colors cursor-pointer"
          >
            რაზე ფიქრობ, {firstName}?
          </button>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div className="flex items-center justify-between pt-2">
          {/* Live Video */}
          <button 
            onClick={() => setIsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-gray-600 dark:text-gray-300 font-semibold text-[14px] transition-colors cursor-pointer"
          >
            <LiveVideoIcon className="w-6 h-6" />
            <span className="hidden sm:inline">პირდაპირი ეთერი</span>
          </button>

          {/* Photo/Video */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-gray-600 dark:text-gray-300 font-semibold text-[14px] transition-colors cursor-pointer"
          >
            <PhotoVideoIcon className="w-6 h-6" />
            <span>ფოტო/ვიდეო</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </button>

          {/* Feeling/Activity */}
          <button 
            onClick={() => { setFeeling(FEELINGS[0].emoji + " " + FEELINGS[0].label); setIsOpen(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] text-gray-600 dark:text-gray-300 font-semibold text-[14px] transition-colors cursor-pointer"
          >
            <FeelingSmileIcon className="w-6 h-6" />
            <span className="hidden sm:inline">გრძნობა/აქტივობა</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#242526] w-full max-w-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col my-auto">
            {/* Header */}
            <div className="relative py-3.5 px-4 text-center border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-[20px] text-[#050505] dark:text-[#E4E6EB]">
                პოსტის შექმნა
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-3.5 top-3 w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Author info */}
            <div className="p-4 flex items-center gap-3">
              {currentUser.image ? (
                <img 
                  src={currentUser.image} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                  {currentUser.name?.[0] || "U"}
                </div>
              )}
              <div>
                <p className="font-bold text-[15px] text-[#050505] dark:text-[#E4E6EB] leading-none mb-1">
                  {currentUser.name}
                </p>
                <div className="inline-flex items-center gap-1 bg-[#E4E6EB] dark:bg-[#3A3B3C] text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md text-[12px] font-semibold cursor-pointer">
                  <GlobeIcon className="w-3 h-3" />
                  <span>საჯარო</span>
                  <span className="text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`რაზე ფიქრობ, ${firstName}?`}
                rows={imagePreview ? 3 : 5}
                className="w-full bg-transparent border-none outline-none text-[#050505] dark:text-white text-[18px] placeholder-gray-500 resize-none font-normal"
                autoFocus
              />

              {/* Selected Feeling Tag */}
              {feeling && (
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-[#0866FF] dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm w-fit font-medium">
                  <span>გრძნობს თავს {feeling}</span>
                  <button 
                    type="button" 
                    onClick={() => setFeeling(null)} 
                    className="hover:text-red-500 font-bold ml-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Image Preview Area */}
              {imagePreview && (
                <div className="relative border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden max-h-[300px] bg-black/5 dark:bg-black/20 flex items-center justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Upload preview" 
                    className="w-full h-full object-contain max-h-[300px]" 
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-[#3A3B3C] shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 font-bold transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Add to your post bar */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 flex items-center justify-between">
                <span className="font-semibold text-[14px] text-[#050505] dark:text-[#E4E6EB]">
                  დაამატეთ თქვენს პოსტს
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center justify-center transition-colors cursor-pointer"
                    title="ფოტო/ვიდეო"
                  >
                    <PhotoVideoIcon className="w-6 h-6" />
                  </button>
                  <input 
                    type="file" 
                    ref={modalFileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />

                  {/* Feeling selector buttons */}
                  <div className="flex gap-0.5">
                    {FEELINGS.slice(0, 3).map(f => (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() => setFeeling(f.emoji + " " + f.label)}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center justify-center text-lg transition-colors cursor-pointer"
                        title={f.label}
                      >
                        {f.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={(!content.trim() && !imageFile) || loading}
                className="w-full bg-[#0866FF] hover:bg-[#0759E0] disabled:bg-[#E4E6EB] dark:disabled:bg-[#3A3B3C] disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-bold py-2.5 rounded-lg transition-colors text-[15px] cursor-pointer mt-1"
              >
                {loading ? "ქვეყნდება..." : "გამოქვეყნება"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
