import React from "react";

// Top Bar Icons
export const FacebookLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 36 36" fill="url(#fb-grad)" className={className}>
    <defs>
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="fb-grad">
        <stop stopColor="#18ACFE" offset="0%" />
        <stop stopColor="#0163E0" offset="100%" />
      </linearGradient>
    </defs>
    <path d="M15 35.8C6.5 34.3 0 26.9 0 18 0 8.1 8.1 0 18 0s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-14h4l1-5h-5v-3.5c0-1.4.4-2.5 2.5-2.5H23V6.2c-.7-.1-2.4-.2-4.2-.2-4.2 0-7 2.6-7 7.3V17H7.5l.5 5h4v13.8z" fill="#0866FF" />
    <path d="M22 22l-1 5h-4v13.8c1.6.2 3.3.2 5 .2V27h3.8l.6-5H22v-3.5c0-1.4.4-2.5 2.5-2.5H27V11c-.7-.1-2.4-.2-4.2-.2-4.2 0-7 2.6-7 7.3V22h-3.8l.5 5h3.3v13.8c-1.7-.3-3.4-.8-5-1.5V27h-4l.5-5H12v-3.7c0-4.7 2.8-7.3 7-7.3 1.8 0 3.5.1 4.2.2v4.8h-2.5c-2.1 0-2.5 1.1-2.5 2.5V22h3.8z" fill="#FFFFFF" />
  </svg>
);

export const HomeIcon = ({ className = "w-7 h-7", filled = false }: { className?: string; filled?: boolean }) => (
  filled ? (
    <svg viewBox="0 0 28 28" fill="currentColor" className={className}>
      <path d="M25.75 14.15 14.9 3.3a1.3 1.3 0 0 0-1.8 0L2.25 14.15a1 1 0 0 0 .7 1.7h1.9v8.65a1.5 1.5 0 0 0 1.5 1.5h4.5a1 1 0 0 0 1-1v-5.5a1 1 0 0 1 1-1h2.3a1 1 0 0 1 1 1v5.5a1 1 0 0 0 1 1h4.5a1.5 1.5 0 0 0 1.5-1.5V15.85h1.9a1 1 0 0 0 .7-1.7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13.5 14 3.5l11 10M5.5 11.5v12a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-12" />
    </svg>
  )
);

export const VideoIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="22" height="18" rx="3" />
    <polygon points="12 10 18 14 12 18 12 10" fill="currentColor" stroke="none" />
  </svg>
);

export const MarketplaceIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10l2-6h16l2 6v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10z" />
    <path d="M4 10h20" />
    <path d="M10 14a4 4 0 0 0 8 0" />
  </svg>
);

export const GroupsIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M4 22c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="19" cy="8" r="3" />
    <path d="M19 14c2.2 0 4 1.8 4 4" />
  </svg>
);

export const GamingIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="22" height="14" rx="4" />
    <path d="M8 14h4M10 12v4M17 13h.01M19 15h.01" strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

export const MenuGridIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="5" cy="5" r="2" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="12" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
  </svg>
);

export const MessengerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.07 2 11.08c0 2.86 1.45 5.42 3.73 7.02V22l3.65-2.01c.84.23 1.72.36 2.62.36 5.52 0 10-4.07 10-9.08S17.52 2 12 2zm1.06 12.18l-2.58-2.75-5.04 2.75 5.54-5.88 2.65 2.75 4.97-2.75-5.54 5.88z" />
  </svg>
);

export const BellIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6V10c0-3.53-1.89-6.49-5.18-7.27V2a1.82 1.82 0 0 0-3.64 0v.73C6.89 3.51 5 6.47 5 10v6l-2 2v1h18v-1l-2-2z" />
  </svg>
);

export const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);

// Feed / Post Icons
export const LiveVideoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#F3425F" className={className}>
    <path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z" />
  </svg>
);

export const PhotoVideoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#45BD62" className={className}>
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

export const FeelingSmileIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#F7B125" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);

export const GlobeIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm5.93 7h-2.54c-.18-2-.72-3.75-1.54-5.07A6.98 6.98 0 0 1 13.93 7zM8 1.05c.92 1.34 1.58 3.3 1.77 4.95H6.23C6.42 4.35 7.08 2.39 8 1.05zM2.07 7A6.98 6.98 0 0 1 6.15 1.93C5.33 3.25 4.79 5 4.61 7H2.07zm0 2h2.54c.18 2 .72 3.75 1.54 5.07A6.98 6.98 0 0 1 2.07 9zm5.93 5.95c-.92-1.34-1.58-3.3-1.77-4.95h3.54c-.19 1.65-.85 3.61-1.77 4.95zm1.85-.88c.82-1.32 1.36-3.07 1.54-5.07h2.54a6.98 6.98 0 0 1-4.08 5.07z" />
  </svg>
);

export const MoreDotsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

// Reaction Action Icons
export const LikeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

export const LikeIconFilled = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#0866FF" className={className}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

export const CommentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const ShareIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// Sidebar Icons
export const FriendsColoredIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <div className={`rounded-full bg-[#1877F2]/10 dark:bg-blue-900/30 flex items-center justify-center text-[#1877F2] ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  </div>
);

export const MemoriesColoredIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <div className={`rounded-full bg-[#00B2FF]/10 dark:bg-cyan-900/30 flex items-center justify-center text-[#00B2FF] ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z" />
    </svg>
  </div>
);

export const SavedColoredIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <div className={`rounded-full bg-[#A033FF]/10 dark:bg-purple-900/30 flex items-center justify-center text-[#A033FF] ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
    </svg>
  </div>
);

export const GroupsColoredIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <div className={`rounded-full bg-[#00C4CC]/10 dark:bg-teal-900/30 flex items-center justify-center text-[#00C4CC] ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

export const VideoColoredIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <div className={`rounded-full bg-[#2ABBA7]/10 dark:bg-emerald-900/30 flex items-center justify-center text-[#2ABBA7] ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
    </svg>
  </div>
);
