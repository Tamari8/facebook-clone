import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedClient from "../../FeedClient";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/ProfileHeader";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const { id: profileId } = await params;

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, image: true, coverImage: true }
  });

  if (!currentUser) redirect("/login");

  const profileUser = await prisma.user.findUnique({
    where: { id: profileId },
    select: { id: true, name: true, image: true, coverImage: true, email: true, createdAt: true, bio: true }
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
        <ProfileHeader
          profileUser={profileUser}
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          friendshipStatus={friendshipStatus}
        />

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
