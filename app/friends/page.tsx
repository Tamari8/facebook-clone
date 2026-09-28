import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import FriendsClient from "./FriendsClient";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, image: true }
  });

  if (!currentUser) redirect("/login");

  // 1. Fetch pending requests received
  const pendingRequests = await prisma.friendship.findMany({
    where: {
      friendId: currentUser.id,
      status: "PENDING"
    },
    include: {
      user: { select: { id: true, name: true, image: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // 2. Fetch accepted friendships
  const acceptedFriendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { userId: currentUser.id },
        { friendId: currentUser.id }
      ]
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      friend: { select: { id: true, name: true, image: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const acceptedFriends = acceptedFriendships.map(f => 
    f.userId === currentUser.id ? f.friend : f.user
  );

  // 3. Exclude all related users from suggestions
  const allRelatedFriendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: currentUser.id },
        { friendId: currentUser.id }
      ]
    }
  });

  const excludedUserIds = [
    currentUser.id,
    ...allRelatedFriendships.map(f => f.userId === currentUser.id ? f.friendId : f.userId)
  ];

  const suggestedUsers = await prisma.user.findMany({
    where: {
      id: { notIn: excludedUserIds }
    },
    take: 12,
    select: { id: true, name: true, image: true }
  });

  const userBasic = {
    id: currentUser.id,
    name: currentUser.name,
    image: currentUser.image
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] font-sans text-[#050505] dark:text-[#E4E6EB]">
      <Navbar currentUser={userBasic} />
      <FriendsClient 
        currentUser={userBasic}
        initialRequests={pendingRequests}
        initialFriends={acceptedFriends}
        initialSuggestions={suggestedUsers}
      />
    </div>
  );
}
