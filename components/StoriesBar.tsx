"use client";

import { useState } from "react";
import CreateStoryModal from "./CreateStoryModal";
import StoryViewerModal from "./StoryViewerModal";

type ReactionType = {
  id: string;
  emoji: string;
  userId: string;
  user: { id: string; name: string | null; image: string | null };
};

type StoryType = {
  id: string;
  imageUrl: string;
  createdAt: Date | string;
  expiresAt: Date | string;
  reactions?: ReactionType[];
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
  const [stories, setStories] = useState<GroupedStories[]>(initialStories);
  const [activeStoryGroup, setActiveStoryGroup] = useState<GroupedStories | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleStoryDeleted = (deletedStoryId: string) => {
    setStories(prev => {
      return prev
        .map(group => ({
          ...group,
          stories: group.stories.filter(s => s.id !== deletedStoryId)
        }))
        .filter(group => group.stories.length > 0);
    });
  };

  const handleStoryCreated = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-4 scrollbar-none select-none">
        {/* Create Story Card */}
        <div 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex-shrink-0 w-[125px] sm:w-[140px] h-[200px] sm:h-[220px] rounded-2xl bg-white dark:bg-[#242526] shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden cursor-pointer group flex flex-col transition-transform hover:-translate-y-0.5"
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
              +
            </div>
            <span className="text-[13px] font-semibold text-[#050505] dark:text-[#E4E6EB] text-center leading-tight">
              ისტორიის შექმნა
            </span>
          </div>
        </div>

        {/* Stories list */}
        {stories.map(group => {
          const firstStory = group.stories[0];
          return (
            <div 
              key={group.user.id} 
              onClick={() => setActiveStoryGroup(group)}
              className="flex-shrink-0 w-[125px] sm:w-[140px] h-[200px] sm:h-[220px] rounded-2xl relative overflow-hidden cursor-pointer group shadow-sm border border-gray-200 dark:border-gray-800 transition-transform hover:-translate-y-0.5"
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

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleStoryCreated}
      />

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <StoryViewerModal
          group={activeStoryGroup}
          currentUserId={currentUser.id}
          onClose={() => setActiveStoryGroup(null)}
          onDeleted={handleStoryDeleted}
        />
      )}
    </>
  );
}
