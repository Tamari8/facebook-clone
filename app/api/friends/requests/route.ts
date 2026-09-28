import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser) return NextResponse.json([], { status: 401 });

  const requests = await prisma.friendship.findMany({
    where: {
      friendId: currentUser.id,
      status: "PENDING"
    },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    }
  });

  return NextResponse.json(requests);
}
