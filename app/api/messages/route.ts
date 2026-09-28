import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const friendId = searchParams.get("friendId");

  if (!friendId) {
    return NextResponse.json([]);
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!currentUser) {
    return NextResponse.json([], { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUser.id, receiverId: friendId },
        { senderId: friendId, receiverId: currentUser.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  // Mark message notifications from this friend as read
  await prisma.notification.updateMany({
    where: {
      userId: currentUser.id,
      actorId: friendId,
      type: "MESSAGE",
      read: false
    },
    data: { read: true }
  });

  return NextResponse.json(messages, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!currentUser) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = await req.json();
  const { receiverId, content } = body;

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: {
      senderId: currentUser.id,
      receiverId,
      content: content.trim(),
    }
  });

  // Create notification for receiver
  try {
    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: currentUser.id,
        type: "MESSAGE",
      }
    });
  } catch (err) {
    console.error(err);
  }

  return NextResponse.json({ success: true, message: msg });
}
