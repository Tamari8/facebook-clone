"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ---- MESSAGES ----

export async function getContacts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      friendRequestsSent: { where: { status: "ACCEPTED" }, include: { friend: true } },
      friendRequestsReceived: { where: { status: "ACCEPTED" }, include: { user: true } },
    }
  });

  if (!user) return [];

  const friends = [
    ...user.friendRequestsSent.map(f => f.friend),
    ...user.friendRequestsReceived.map(f => f.user)
  ];

  return friends.map(f => ({ id: f.id, name: f.name, image: f.image }));
}

export async function getMessages(otherUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return [];

  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user.id },
      ]
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(receiverId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !content.trim()) return { success: false };

  await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content,
    }
  });

  // Create notification for recipient
  try {
    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: user.id,
        type: "MESSAGE",
      }
    });
  } catch (err) {
    console.error("Failed to create message notification:", err);
  }

  revalidatePath("/messages");
  revalidatePath("/");
  return { success: true };
}

// ---- NOTIFICATIONS ----

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return [];

  return await prisma.notification.findMany({
    where: { 
      userId: user.id,
      type: { not: "MESSAGE" }
    },
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true, image: true } } },
    take: 10,
  });
}

export async function markNotificationsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { success: false };

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true }
  });

  revalidatePath("/");
  return { success: true };
}
