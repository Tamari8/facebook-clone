import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ unreadCount: 0, conversations: [] });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!currentUser) {
    return NextResponse.json({ unreadCount: 0, conversations: [] });
  }

  // 1. Count unread message notifications
  const unreadCount = await prisma.notification.count({
    where: {
      userId: currentUser.id,
      type: "MESSAGE",
      read: false
    }
  });

  // 2. Fetch recent message partners
  const recentMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUser.id },
        { receiverId: currentUser.id }
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 40
  });

  const partnerIds: string[] = [];
  const latestMessageMap: Record<string, typeof recentMessages[0]> = {};

  for (const msg of recentMessages) {
    const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
    if (!partnerIds.includes(partnerId)) {
      partnerIds.push(partnerId);
      latestMessageMap[partnerId] = msg;
    }
  }

  const partnerUsers = partnerIds.length > 0 ? await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, name: true, image: true }
  }) : [];

  const partnerUserMap = new Map(partnerUsers.map(u => [u.id, u]));
  const conversations = partnerIds
    .map(id => {
      const partner = partnerUserMap.get(id);
      if (!partner) return null;
      return {
        user: partner,
        lastMessage: latestMessageMap[id]?.content || "",
        lastMessageTime: latestMessageMap[id]?.createdAt || new Date(),
        isFromMe: latestMessageMap[id]?.senderId === currentUser.id
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    unreadCount,
    conversations
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
