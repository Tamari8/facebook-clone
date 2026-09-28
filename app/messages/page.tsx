import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams
}: {
  searchParams?: Promise<{ userId?: string; friendId?: string }>
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const targetFriendId = resolvedSearchParams.userId || resolvedSearchParams.friendId;

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      friendRequestsSent: { where: { status: "ACCEPTED" }, include: { friend: { select: { id: true, name: true, image: true } } } },
      friendRequestsReceived: { where: { status: "ACCEPTED" }, include: { user: { select: { id: true, name: true, image: true } } } },
    }
  });

  if (!currentUser) redirect("/login");

  const acceptedFriends = [
    ...currentUser.friendRequestsSent.map(f => f.friend),
    ...currentUser.friendRequestsReceived.map(f => f.user)
  ];

  // Fetch any users who have exchanged messages with current user
  const messagePartners = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUser.id },
        { receiverId: currentUser.id }
      ]
    },
    select: { senderId: true, receiverId: true },
    orderBy: { createdAt: "desc" }
  });

  const partnerIds = Array.from(new Set(
    messagePartners.map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
  )).filter(id => !acceptedFriends.some(f => f.id === id));

  const extraContacts = partnerIds.length > 0 ? await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, name: true, image: true }
  }) : [];

  let allContacts = [...acceptedFriends, ...extraContacts];

  // If a target friend is requested via query param and not in contacts list, fetch and add them
  if (targetFriendId && !allContacts.some(c => c.id === targetFriendId)) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetFriendId },
      select: { id: true, name: true, image: true }
    });
    if (targetUser) {
      allContacts = [targetUser, ...allContacts];
    }
  }

  const navUser = { id: currentUser.id, name: currentUser.name, image: currentUser.image };

  return (
    <div className="h-screen bg-[#f0f2f5] dark:bg-gray-900 font-sans flex flex-col overflow-hidden">
      <Navbar currentUser={navUser} />
      <div className="flex-1 flex overflow-hidden">
        <ChatClient currentUser={navUser} friends={allContacts} initialFriendId={targetFriendId} />
      </div>
    </div>
  );
}
