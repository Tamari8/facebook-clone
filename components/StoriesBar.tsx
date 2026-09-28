"use client";

import { useState, useRef } from "react";
import { createStory } from "@/app/actions/story";

type StoryType = {
  id: string;
  imageUrl: string;
  createdAt: Date;
  expiresAt: Date;
};

type GroupedStories = {
  user: { id: string; name: string | null; image: string | null };
  stories: StoryType[];
};

export default function StoriesBar({ 
  initialStories, 
  currentUser 
}: { 
  initialStories: GroupedStories[]; 
  currentUser: any;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stories, setStories] = useState<GroupedStories[]>(initialStories);
  const [activeStoryGroup, setActiveStoryGroup] = useState<GroupedStories | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    
    const previewUrl = URL.createObjectURL(file);
    // Optimistic addition
    const newGroup: GroupedStories = {
      user: currentUser,
      stories: [{
        id: "temp-" + Date.now(),
        imageUrl: previewUrl,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000)
      }]
    };
    setStories(prev => [newGroup, ...prev.filter(g => g.user.id !== currentUser.id)]);

    try {
      await createStory(formData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-4 scrollbar-none select-none">
        {/* Create Story Card */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-[125px] sm:w-[140px] h-[200px] sm:h-[220px] rounded-2xl bg-white dark:bg-[#242526] shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden cursor-pointer group flex flex-col"
        >
          <div className="h-[145px] sm:h-[160px] overflow-hidden relative bg-gray-100 dark:bg-gray-800">
            {currentUser.image ? (
              <img 
                src={currentUser.image} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                alt="Me" 
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-3xl text-gray-600 dark:text-gray-300">
                {currentUser.name?.[0] || "U"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors" />
          </div>

          <div className="flex-1 relative flex flex-col items-center justify-end pb-2.5 px-2 bg-white dark:bg-[#242526]">
            <div className="absolute -top-5 w-10 h-10 rounded-full bg-[#0866FF] border-4 border-white dark:border-[#242526] flex items-center justify-center text-white font-bold text-2xl shadow-md group-hover:bg-[#0759E0] transition-colors">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "+"
              )}
            </div>
            <span className="text-[13px] font-semibold text-[#050505] dark:text-[#E4E6EB] text-center leading-tight">
              ისტორიის შექმნა
            </span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        {/* Stories list */}
        {stories.map(group => {
          const firstStory = group.stories[0];
          return (
            <div 
              key={group.user.id} 
              onClick={() => setActiveStoryGroup(group)}
              className="flex-shrink-0 w-[125px] sm:w-[140px] h-[200px] sm:h-[220px] rounded-2xl relative overflow-hidden cursor-pointer group shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <img 
                src={firstStory.imageUrl} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                alt="Story" 
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />
              
              {/* User avatar with Facebook blue border */}
              <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-[3px] border-[#0866FF] overflow-hidden bg-white shadow-md">
                {group.user.image ? (
                  <img src={group.user.image} className="w-full h-full object-cover" alt={group.user.name || ""} />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 text-sm">
                    {group.user.name?.[0] || "U"}
                  </div>
                )}
              </div>
              
              {/* User Name */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-[13px] font-bold leading-tight drop-shadow-md truncate">
                {group.user.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <button 
            onClick={() => setActiveStoryGroup(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
          <div className="relative w-full max-w-[400px] h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 flex flex-col justify-between p-4">
            {/* Story Header */}
            <div className="flex items-center gap-3 z-10">
              <div className="w-10 h-10 rounded-full border-2 border-[#0866FF] overflow-hidden">
                {activeStoryGroup.user.image ? (
                  <img src={activeStoryGroup.user.image} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold">
                    {activeStoryGroup.user.name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">{activeStoryGroup.user.name}</p>
                <p className="text-white/70 text-xs mt-0.5">აქტიური ისტორია</p>
              </div>
            </div>

            {/* Story Image */}
            <img 
              src={activeStoryGroup.stories[0].imageUrl} 
              alt="Story" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
