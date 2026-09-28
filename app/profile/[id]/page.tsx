import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedClient from "../../FeedClient";
import Navbar from "@/components/Navbar";
import ProfileEditModal from "@/components/ProfileEditModal";
import Link from "next/link";
import FriendButton from "./FriendButton"; // We will create this

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const { id: profileId } = await params;

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, image: true }
  });

  if (!currentUser) redirect("/login");

  const profileUser = await prisma.user.findUnique({
    where: { id: profileId },
    select: { id: true, name: true, image: true, email: true, createdAt: true, bio: true }
  });

  if (!profileUser) {
    return <div>მომხმარებელი არ მოიძებნა</div>;
  }

  const isOwnProfile = currentUser.id === profileUser.id;

  // Check friendship status
  let friendshipStatus = "NONE";
  if (!isOwnProfile) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, friendId: profileUser.id },
          { userId: profileUser.id, friendId: currentUser.id }
        ]
      }
    });
    if (friendship) {
      if (friendship.status === "ACCEPTED") {
        friendshipStatus = "FRIENDS";
      } else if (friendship.userId === currentUser.id) {
        friendshipStatus = "REQUEST_SENT";
      } else {
        friendshipStatus = "REQUEST_RECEIVED";
      }
    }
  }

  const posts = await prisma.post.findMany({
    where: { authorId: profileUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: { select: { userId: true, type: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } }
        },
        orderBy: { createdAt: "asc" }
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 font-sans pb-10">
      <Navbar currentUser={currentUser} />

      <main className="mx-auto max-w-[940px] w-full">
        {/* Profile Header Block */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-b-lg overflow-hidden mb-4 border border-gray-200 dark:border-gray-700 border-t-0">
          <div className="h-[250px] md:h-[350px] bg-gradient-to-r from-blue-300 via-blue-400 to-blue-600 w-full relative group cursor-pointer rounded-b-lg flex flex-col justify-end">
            {isOwnProfile && (
              <div className="absolute right-4 bottom-4 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-md font-semibold text-sm shadow flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-black dark:text-white">
                <span className="text-lg">📷</span> ყდის დამატება
              </div>
            )}
          </div>
          <div className="px-4 md:px-8 relative max-w-[900px] mx-auto pb-4">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-[50px] md:-mt-[30px] mb-4 gap-4 md:gap-6">
              <div className="rounded-full bg-white dark:bg-gray-800 p-1 border-4 border-white dark:border-gray-800 shadow-sm relative z-10">
                {profileUser.image ? (
                  <img src={profileUser.image} alt={profileUser.name || ""} className="w-[168px] h-[168px] rounded-full object-cover" />
                ) : (
                  <div className="w-[168px] h-[168px] rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                {isOwnProfile && (
                  <div className="absolute right-2 bottom-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-white dark:border-gray-800 shadow-sm">
                    📷
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1 md:pb-4">
                <h1 className="text-[32px] font-bold text-[#050505] dark:text-white leading-tight">{profileUser.name}</h1>
                <p className="text-[#65676b] dark:text-gray-400 font-semibold">{profileUser.email}</p>
                {profileUser.bio && (
                  <p className="text-[#050505] dark:text-gray-200 text-[15px] mt-2 italic">"{profileUser.bio}"</p>
                )}
                <p className="text-[#65676b] dark:text-gray-400 text-[15px] mt-1">
                  დარეგისტრირდა: {new Date(profileUser.createdAt).toLocaleDateString("ka-GE")}
                </p>
              </div>
              <div className="md:pb-6 flex gap-2 w-full md:w-auto px-4 md:px-0">
                 {isOwnProfile ? (
                   <>
                     <button className="flex-1 md:flex-none bg-[#0866ff] hover:bg-[#0759e0] text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                       <span className="text-lg">+</span> ისტორიაში დამატება
                     </button>
                     <ProfileEditModal currentUser={profileUser as any} />
                   </>
                 ) : (
                   <div className="flex items-center gap-2">
                     <FriendButton profileId={profileUser.id} initialStatus={friendshipStatus} />
                     <Link
                       href={`/messages?userId=${profileUser.id}`}
                       className="bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] text-[#050505] dark:text-[#E4E6EB] font-semibold py-2 px-4 rounded-md flex items-center gap-1.5 transition-colors text-sm"
                     >
                       💬 მესიჯი
                     </Link>
                   </div>
                 )}
              </div>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 mt-2" />
            <div className="flex justify-between mt-1">
              <div className="flex space-x-1">
                <div className="text-[#0866ff] border-b-4 border-[#0866ff] px-4 py-3 cursor-pointer font-semibold rounded-t-lg hover:bg-gray-50 dark:hover:bg-gray-700">პოსტები</div>
                <div className="text-[#65676b] dark:text-gray-400 px-4 py-3 cursor-pointer font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">შესახებ</div>
                <div className="text-[#65676b] dark:text-gray-400 px-4 py-3 cursor-pointer font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">მეგობრები</div>
                <div className="text-[#65676b] dark:text-gray-400 px-4 py-3 cursor-pointer font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">ფოტოები</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="flex flex-col md:flex-row gap-4 max-w-[900px] mx-auto px-4 md:px-0">
          {/* Sidebar */}
          <div className="w-full md:w-[360px] flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-[#050505] dark:text-white mb-4">შესახებ</h2>
              <div className="flex items-center gap-3 text-[#050505] dark:text-gray-200 mb-4">
                <span className="text-xl text-gray-500">🎓</span> 
                <span>სწავლობდა <strong>Freeuni</strong>-ში</span>
              </div>
              <div className="flex items-center gap-3 text-[#050505] dark:text-gray-200 mb-4">
                <span className="text-xl text-gray-500">🏠</span> 
                <span>ცხოვრობს ქალაქ <strong>თბილისში</strong></span>
              </div>
              {isOwnProfile && (
                <button className="w-full bg-[#e4e6eb] dark:bg-gray-700 hover:bg-[#d8dadf] dark:hover:bg-gray-600 text-[#050505] dark:text-white font-semibold py-1.5 rounded-lg transition-colors">
                  დეტალების რედაქტირება
                </button>
              )}
            </div>
          </div>
          
          {/* Main Feed Column */}
          <div className="flex-1 pb-10">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 font-bold text-[20px] text-[#050505] dark:text-white">
                {isOwnProfile ? "ჩემი პოსტები" : `${profileUser.name?.split(" ")[0]}-ს პოსტები`}
             </div>
             {/* Note: FeedClient handles creation and displaying. We should pass a flag if it's not our profile to disable creation, or handle it inside FeedClient. */}
             <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden -mx-0">
                <FeedClient initialPosts={posts} currentUser={currentUser} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
