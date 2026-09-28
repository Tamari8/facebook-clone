"use client";

import { useState, useEffect, useRef } from "react";
import { reactToStory, deleteStory } from "@/app/actions/story";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

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

type StoryGroup = {
  user: { id: string; name: string | null; image: string | null };
  stories: StoryType[];
};

export default function StoryViewerModal({
  group,
  currentUserId,
  onClose,
  onDeleted,
}: {
  group: StoryGroup;
  currentUserId: string;
  onClose: () => void;
  onDeleted?: (storyId: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeReactions, setActiveReactions] = useState<ReactionType[]>([]);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [flyingEmoji, setFlyingEmoji] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currentStory = group.stories[currentIndex];
  const isMine = group.user.id === currentUserId;

  // Initialize reactions for current story
  useEffect(() => {
    if (!currentStory) return;
    const storyReactions = currentStory.reactions || [];
    setActiveReactions(storyReactions);
    const mine = storyReactions.find((r) => r.userId === currentUserId);
    setMyReaction(mine?.emoji || null);
    setProgress(0);
  }, [currentIndex, currentStory, currentUserId]);

  // 5-second progress ticker
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < group.stories.length - 1) {
            setCurrentIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 ticks * 100ms = 5000ms (5s)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, group.stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < group.stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const handleReact = async (emoji: string) => {
    setFlyingEmoji(emoji);
    setTimeout(() => setFlyingEmoji(null), 1200);

    setMyReaction(emoji);
    setActiveReactions((prev) => {
      const filtered = prev.filter((r) => r.userId !== currentUserId);
      return [
        ...filtered,
        {
          id: "temp-" + Date.now(),
          emoji,
          userId: currentUserId,
          user: { id: currentUserId, name: "მე", image: null },
        },
      ];
    });

    try {
      await reactToStory(currentStory.id, emoji);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("ნამდვილად გსურთ ისტორიის წაშლა?")) return;
    setDeleting(true);
    try {
      await deleteStory(currentStory.id);
      if (onDeleted) onDeleted(currentStory.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-150">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors cursor-pointer"
        title="დახურვა"
      >
        ✕
      </button>

      {/* Main Container */}
      <div
        className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {group.stories.map((story, i) => (
            <div
              key={story.id}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header: Author + Time + Delete */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#0866FF] overflow-hidden bg-white/10 flex-shrink-0">
              {group.user.image ? (
                <img
                  src={group.user.image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {group.user.name?.[0] || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight drop-shadow-md">
                {group.user.name}
              </p>
              <p className="text-white/80 text-xs drop-shadow-xs">
                {new Date(currentStory.createdAt).toLocaleTimeString("ka-GE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {isMine && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-black/50 hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors backdrop-blur-xs flex items-center gap-1 cursor-pointer"
              title="ისტორიის წაშლა"
            >
              <span>🗑️</span>
              <span>წაშლა</span>
            </button>
          )}
        </div>

        {/* Story Media (Image or SVG Text) */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={currentStory.imageUrl}
            alt="Story content"
            className="w-full h-full object-contain"
          />

          {/* Navigation Click Zones */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
          />

          {/* Prev/Next Chevron buttons */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-sm cursor-pointer"
            >
              ❮
            </button>
          )}
          {currentIndex < group.stories.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-sm cursor-pointer"
            >
              ❯
            </button>
          )}

          {/* Flying Emoji Animation */}
          {flyingEmoji && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40">
              <span className="text-7xl animate-bounce drop-shadow-2xl">
                {flyingEmoji}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Reaction Dock */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-col gap-2">
          {/* Reaction counter badge if any */}
          {activeReactions.length > 0 && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full w-max text-xs text-white">
              <span className="flex -space-x-1">
                {Array.from(new Set(activeReactions.map((r) => r.emoji)))
                  .slice(0, 3)
                  .map((e, idx) => (
                    <span key={idx} className="text-sm">
                      {e}
                    </span>
                  ))}
              </span>
              <span className="font-semibold ml-1">
                {activeReactions.length} რეაქცია
              </span>
            </div>
          )}

          {/* Emojis Selector Bar */}
          <div className="flex items-center justify-around bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-white/10">
            {REACTIONS.map((emoji) => {
              const isSelected = myReaction === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`text-2xl transition-transform hover:scale-130 active:scale-95 cursor-pointer ${
                    isSelected ? "scale-125 drop-shadow-md" : "opacity-85"
                  }`}
                  title={emoji}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
