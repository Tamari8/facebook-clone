"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  createPost, 
  toggleLike, 
  addComment, 
  editPost, 
  deletePost, 
  editComment, 
  deleteComment 
} from "@/app/actions/post";
import { 
  LikeIcon, 
  LikeIconFilled, 
  CommentIcon, 
  ShareIcon, 
  GlobeIcon, 
  MoreDotsIcon 
} from "@/components/icons";
import StoriesBar from "@/components/StoriesBar";
import CreatePostBox from "@/components/CreatePostBox";

type UserType = {
  id: string;
  name: string | null;
  image: string | null;
};

type CommentType = {
  id: string;
  text: string;
  createdAt: Date;
  user: UserType;
};

type PostType = {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date;
  author: UserType;
  likes: { userId: string; type: string }[];
  comments: CommentType[];
};

const FACEBOOK_REACTIONS = [
  { type: "LIKE", emoji: "👍", label: "მომწონს", color: "text-[#0866FF]" },
  { type: "LOVE", emoji: "❤️", label: "მიყვარს", color: "text-[#ED284E]" },
  { type: "CARE", emoji: "🥰", label: "მზრუნველობა", color: "text-[#F7B125]" },
  { type: "HAHA", emoji: "😂", label: "ჰაჰა", color: "text-[#F7B125]" },
  { type: "WOW", emoji: "😮", label: "ვაუ", color: "text-[#F7B125]" },
  { type: "SAD", emoji: "😢", label: "სევდა", color: "text-[#F7B125]" },
  { type: "ANGRY", emoji: "😡", label: "ბრაზი", color: "text-[#E95A2A]" },
];

export default function FeedClient({ 
  initialPosts, 
  currentUser, 
  initialStories = [] 
}: { 
  initialPosts: PostType[]; 
  currentUser: UserType; 
  initialStories?: any[];
}) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [visibleComments, setVisibleComments] = useState<{ [key: string]: boolean }>({});
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editPostText, setEditPostText] = useState("");

  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Handle optimistic post creation from CreatePostBox
  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Optimistic Reactions
  const handleSelectReaction = async (postId: string, reactionType: string) => {
    setHoveredReactionPostId(null);

    // Optimistically update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const existingLike = p.likes.find(l => l.userId === currentUser.id);
      let updatedLikes;

      if (existingLike) {
        if (existingLike.type === reactionType) {
          // Remove like
          updatedLikes = p.likes.filter(l => l.userId !== currentUser.id);
        } else {
          // Change reaction
          updatedLikes = p.likes.map(l => l.userId === currentUser.id ? { ...l, type: reactionType } : l);
        }
      } else {
        // Add reaction
        updatedLikes = [...p.likes, { userId: currentUser.id, type: reactionType }];
      }

      return { ...p, likes: updatedLikes };
    }));

    try {
      await toggleLike(postId, reactionType);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickLikeClick = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    const myLike = post?.likes.find(l => l.userId === currentUser.id);
    handleSelectReaction(postId, myLike ? myLike.type : "LIKE");
  };

  // Optimistic Comments
  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    setVisibleComments(prev => ({ ...prev, [postId]: true }));

    const optimisticComment: CommentType = {
      id: "temp-" + Date.now(),
      text: commentText,
      createdAt: new Date(),
      user: currentUser,
    };

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, optimisticComment] };
    }));

    try {
      await addComment(postId, commentText);
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Edit Post
  const handleEditPostSubmit = async (postId: string) => {
    if (!editPostText.trim()) return;
    const text = editPostText;
    setEditPostId(null);

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: text } : p));

    try {
      await editPost(postId, text);
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("ნამდვილად გსურთ პოსტის წაშლა?")) return;
    setOpenMenuPostId(null);
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await deletePost(postId);
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Edit Comment
  const handleEditCommentSubmit = async (commentId: string, postId: string) => {
    if (!editCommentText.trim()) return;
    const text = editCommentText;
    setEditCommentId(null);

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map(c => c.id === commentId ? { ...c, text } : c)
      };
    }));

    try {
      await editComment(commentId, text);
    } catch (err) {
      console.error(err);
    }
  };

  // Optimistic Delete Comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm("ნამდვილად გსურთ კომენტარის წაშლა?")) return;

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.filter(c => c.id !== commentId)
      };
    }));

    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full font-sans pb-16 select-none">
      <main className="mx-auto max-w-[680px] pt-4 px-2 sm:px-0">
        {/* Stories Reel */}
        <StoriesBar initialStories={initialStories} currentUser={currentUser} />

        {/* Create Post Card */}
        <CreatePostBox currentUser={currentUser} onPostCreated={handlePostCreated} />

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 && (
            <div className="bg-white dark:bg-[#242526] rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-4xl block mb-2">📰</span>
              <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                პოსტები ჯერ არ არის
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                იყავით პირველი და გაუზიარეთ მეგობრებს თქვენი ამბავი!
              </p>
            </div>
          )}

          {posts.map((post) => {
            const myLike = post.likes.find(l => l.userId === currentUser.id);
            const isLiked = !!myLike;
            const currentReaction = isLiked ? (FACEBOOK_REACTIONS.find(r => r.type === myLike?.type) || FACEBOOK_REACTIONS[0]) : null;

            const commentsCount = post.comments.length;
            const isCommentsVisible = visibleComments[post.id];
            const isAuthor = post.author.id === currentUser.id;

            // Unique reaction icons on the post
            const presentReactionTypes = Array.from(new Set(post.likes.map(l => l.type)));
            const topReactions = presentReactionTypes.slice(0, 3).map(type => 
              FACEBOOK_REACTIONS.find(r => r.type === type)?.emoji || "👍"
            );

            return (
              <article 
                key={post.id} 
                className="rounded-xl bg-white dark:bg-[#242526] shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-3.5 pb-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.author.id}`} className="cursor-pointer">
                      {post.author.image ? (
                        <img 
                          src={post.author.image} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                          {post.author.name?.[0] || "U"}
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link 
                        href={`/profile/${post.author.id}`}
                        className="font-bold text-[15px] text-[#050505] dark:text-[#E4E6EB] hover:underline cursor-pointer block leading-tight"
                      >
                        {post.author.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("ka-GE", { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                        <span>•</span>
                        <GlobeIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* 3-dots Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                      className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer transition-colors"
                      title="მეტი მოქმედება"
                    >
                      <MoreDotsIcon className="w-5 h-5" />
                    </button>

                    {openMenuPostId === post.id && (
                      <div className="absolute right-0 top-[40px] bg-white dark:bg-[#242526] shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl w-[200px] py-1.5 z-40 animate-in fade-in duration-100">
                        {isAuthor && (
                          <>
                            <button
                              onClick={() => {
                                setEditPostId(post.id);
                                setEditPostText(post.content);
                                setOpenMenuPostId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                            >
                              <span>✏️</span>
                              <span>რედაქტირება</span>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                            >
                              <span>🗑️</span>
                              <span>წაშლა</span>
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                          </>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + `/?post=${post.id}`);
                            alert("ბმული დაკოპირდა!");
                            setOpenMenuPostId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                        >
                          <span>🔗</span>
                          <span>ბმულის კოპირება</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {editPostId === post.id ? (
                  <div className="px-4 py-2">
                    <textarea
                      value={editPostText}
                      onChange={(e) => setEditPostText(e.target.value)}
                      className="w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3 rounded-xl outline-none text-[15px] resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => setEditPostId(null)}
                        className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        გაუქმება
                      </button>
                      <button 
                        onClick={() => handleEditPostSubmit(post.id)}
                        className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#0866FF] hover:bg-[#0759E0] text-white"
                      >
                        შენახვა
                      </button>
                    </div>
                  </div>
                ) : (
                  post.content && (
                    <div className="px-4 py-1.5 text-[15px] sm:text-[16px] text-[#050505] dark:text-[#E4E6EB] whitespace-pre-wrap leading-normal">
                      {post.content}
                    </div>
                  )
                )}

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="w-full mt-2 bg-black/5 dark:bg-black/40 flex items-center justify-center max-h-[550px] overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-full h-auto max-h-[550px] object-contain" 
                    />
                  </div>
                )}

                {/* Reactions Count & Comments Stats */}
                {(post.likes.length > 0 || commentsCount > 0) && (
                  <div className="flex items-center justify-between px-4 py-2 text-gray-500 dark:text-gray-400 text-[14px]">
                    <div className="flex items-center gap-1 cursor-pointer hover:underline">
                      {topReactions.length > 0 && (
                        <div className="flex items-center -space-x-1">
                          {topReactions.map((emoji, idx) => (
                            <span 
                              key={idx} 
                              className="w-5 h-5 rounded-full bg-white dark:bg-[#242526] flex items-center justify-center text-sm shadow-xs"
                            >
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                      {post.likes.length > 0 && (
                        <span className="font-normal text-[14px] text-gray-600 dark:text-gray-300 ml-1">
                          {post.likes.length}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[14px]">
                      {commentsCount > 0 && (
                        <button 
                          onClick={() => setVisibleComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className="hover:underline cursor-pointer"
                        >
                          {commentsCount} კომენტარი
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="px-3 py-1 border-t border-gray-200 dark:border-gray-700/80">
                  <div className="flex items-center justify-between relative">
                    {/* Floating Facebook Reactions Dock */}
                    {hoveredReactionPostId === post.id && (
                      <div 
                        onMouseEnter={() => {
                          if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
                          setHoveredReactionPostId(post.id);
                        }}
                        onMouseLeave={() => {
                          reactionTimeoutRef.current = setTimeout(() => setHoveredReactionPostId(null), 300);
                        }}
                        className="absolute bottom-[115%] left-0 sm:left-2 bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150"
                      >
                        {FACEBOOK_REACTIONS.map((r) => (
                          <button
                            key={r.type}
                            onClick={() => handleSelectReaction(post.id, r.type)}
                            className="text-3xl hover:scale-135 active:scale-110 transition-transform duration-150 p-1 cursor-pointer flex flex-col items-center group/btn relative"
                            title={r.label}
                          >
                            <span>{r.emoji}</span>
                            <span className="absolute -top-7 bg-black/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              {r.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Like / Reaction Button */}
                    <button
                      onClick={() => handleQuickLikeClick(post.id)}
                      onMouseEnter={() => {
                        if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
                        setHoveredReactionPostId(post.id);
                      }}
                      onMouseLeave={() => {
                        reactionTimeoutRef.current = setTimeout(() => setHoveredReactionPostId(null), 400);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-[14px] sm:text-[15px] transition-colors cursor-pointer ${
                        currentReaction ? currentReaction.color : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {currentReaction ? (
                        <span className="text-lg leading-none">{currentReaction.emoji}</span>
                      ) : (
                        <LikeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                      <span>{currentReaction ? currentReaction.label : "მომწონს"}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() => setVisibleComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      <CommentIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span>კომენტარი</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + `/?post=${post.id}`);
                        alert("პოსტის ბმული დაკოპირებულია!");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      <ShareIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span>გაზიარება</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {(isCommentsVisible || commentsCount > 0) && (
                  <div className="px-4 pb-3 pt-2 bg-gray-50/50 dark:bg-[#1E1F20]/50 border-t border-gray-100 dark:border-gray-800">
                    {/* Comments list */}
                    <div className="space-y-2 mb-3">
                      {post.comments.map((comment) => {
                        const isCommentAuthor = comment.user.id === currentUser.id;
                        return (
                          <div key={comment.id} className="flex gap-2 group">
                            <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0 mt-0.5">
                              {comment.user.image ? (
                                <img 
                                  src={comment.user.image} 
                                  alt="" 
                                  className="w-8 h-8 rounded-full object-cover" 
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-xs">
                                  {comment.user.name?.[0] || "U"}
                                </div>
                              )}
                            </Link>

                            <div className="flex-1 max-w-[85%]">
                              <div className="bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-2xl px-3 py-2 inline-block relative">
                                <Link 
                                  href={`/profile/${comment.user.id}`}
                                  className="font-bold text-[13px] text-[#050505] dark:text-[#E4E6EB] hover:underline block leading-tight cursor-pointer"
                                >
                                  {comment.user.name}
                                </Link>

                                {editCommentId === comment.id ? (
                                  <div className="mt-1">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="w-full bg-white dark:bg-gray-700 text-[#050505] dark:text-white p-1.5 rounded-lg outline-none text-[13px] resize-none"
                                      rows={2}
                                    />
                                    <div className="flex justify-end gap-1.5 mt-1">
                                      <button 
                                        onClick={() => setEditCommentId(null)}
                                        className="text-[11px] font-semibold text-gray-500 hover:underline"
                                      >
                                        გაუქმება
                                      </button>
                                      <button 
                                        onClick={() => handleEditCommentSubmit(comment.id, post.id)}
                                        className="text-[11px] font-semibold text-[#0866FF] hover:underline"
                                      >
                                        შენახვა
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[14px] text-[#050505] dark:text-[#E4E6EB] leading-snug mt-0.5 whitespace-pre-wrap">
                                    {comment.text}
                                  </p>
                                )}
                              </div>

                              {/* Comment Actions */}
                              <div className="flex items-center gap-3 text-[12px] text-gray-500 dark:text-gray-400 pl-3 mt-1 font-semibold">
                                <span className="hover:underline cursor-pointer">მომწონს</span>
                                <span className="hover:underline cursor-pointer">პასუხი</span>
                                <span className="font-normal text-gray-400">
                                  {new Date(comment.createdAt).toLocaleDateString("ka-GE", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {isCommentAuthor && editCommentId !== comment.id && (
                                  <>
                                    <span 
                                      onClick={() => {
                                        setEditCommentId(comment.id);
                                        setEditCommentText(comment.text);
                                      }}
                                      className="hover:underline text-blue-500 cursor-pointer"
                                    >
                                      ჩასწორება
                                    </span>
                                    <span 
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      className="hover:underline text-red-500 cursor-pointer"
                                    >
                                      წაშლა
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comment Input Box */}
                    <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2 mt-2">
                      <div className="flex-shrink-0">
                        {currentUser.image ? (
                          <img 
                            src={currentUser.image} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-xs">
                            {currentUser.name?.[0] || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-full flex items-center px-4 py-1.5 focus-within:ring-1 focus-within:ring-[#0866FF] transition-all">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="დაწერეთ კომენტარი..."
                          className="w-full bg-transparent border-none outline-none text-[14px] text-[#050505] dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        {commentInputs[post.id]?.trim() && (
                          <button 
                            type="submit" 
                            className="text-[#0866FF] font-bold text-sm hover:underline ml-2 cursor-pointer flex-shrink-0"
                          >
                            გაგზავნა
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
