"use client";

import { useState, useRef } from "react";
import { createStory } from "@/app/actions/story";

const GRADIENTS = [
  { name: "Facebook Blue", value: "linear-gradient(135deg, #0866FF 0%, #1877F2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)" },
  { name: "Purple Dream", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Neon Green", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Dark Velvet", value: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
];

export default function CreateStoryModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<"PHOTO" | "TEXT">("PHOTO");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[1].value);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "PHOTO" && !imageFile) {
      alert("გთხოვთ აირჩიოთ ფოტო");
      return;
    }
    if (tab === "TEXT" && !storyText.trim()) {
      alert("გთხოვთ ჩაწეროთ ტექსტი");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    if (tab === "PHOTO" && imageFile) {
      formData.append("image", imageFile);
    } else {
      formData.append("text", storyText.trim());
      formData.append("bgColor", selectedGradient);
    }

    const res = await createStory(formData);
    setLoading(false);

    if (res.success) {
      onClose();
      onSuccess();
    } else {
      alert(res.message || "შეცდომა ისტორიის შექმნისას");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-[#242526] w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#050505] dark:text-[#E4E6EB]">
            ისტორიის შექმნა
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 bg-[#F0F2F5] dark:bg-[#18191A] m-4 rounded-xl gap-2">
          <button
            type="button"
            onClick={() => setTab("PHOTO")}
            className={`flex-1 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              tab === "PHOTO"
                ? "bg-white dark:bg-[#242526] text-[#0866FF] shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <span>📷</span>
            <span>ფოტოს ისტორია</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("TEXT")}
            className={`flex-1 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              tab === "TEXT"
                ? "bg-white dark:bg-[#242526] text-[#0866FF] shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <span>📝</span>
            <span>ტექსტური ისტორია</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {tab === "PHOTO" ? (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative aspect-[9/14] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-black">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-black text-xs font-bold py-1.5 px-3 rounded-full shadow-md transition-colors cursor-pointer"
                  >
                    შეცვლა
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[9/14] w-full max-w-[280px] mx-auto rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#0866FF] flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50 dark:bg-gray-800/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#0866FF] flex items-center justify-center text-2xl">
                    📷
                  </div>
                  <div className="text-center px-4">
                    <p className="font-bold text-sm text-[#050505] dark:text-[#E4E6EB]">
                      აირჩიეთ ფოტო
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      დააკლიკეთ აქ ფოტოს ასატვირთად
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Text Preview Canvas */}
              <div
                style={{ background: selectedGradient }}
                className="aspect-[9/14] w-full max-w-[280px] mx-auto rounded-2xl p-6 flex items-center justify-center text-center shadow-lg transition-all"
              >
                <p className="text-white font-bold text-xl leading-relaxed break-words max-h-[300px] overflow-y-auto">
                  {storyText || "დაიწყეთ წერა..."}
                </p>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  ისტორიის ტექსტი:
                </label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="ჩაწერეთ რაიმე თქვენს ისტორიაში..."
                  rows={3}
                  maxLength={150}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3 outline-none focus:border-[#0866FF] resize-none text-sm"
                />
              </div>

              {/* Gradient Color Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  ფონის ფერი:
                </label>
                <div className="flex gap-2 justify-center">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setSelectedGradient(g.value)}
                      style={{ background: g.value }}
                      className={`w-9 h-9 rounded-full transition-transform cursor-pointer ${
                        selectedGradient === g.value
                          ? "ring-4 ring-[#0866FF] scale-110"
                          : "hover:scale-105 opacity-85"
                      }`}
                      title={g.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0866FF] hover:bg-[#0759E0] text-white font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-[15px] shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ზიარდება...</span>
                </>
              ) : (
                <span>გაზიარება ისტორიაში</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
