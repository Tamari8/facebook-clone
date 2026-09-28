"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createStory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  const image = formData.get("image") as File | null;
  if (!image || image.size === 0) return { success: false, message: "ფოტო სავალდებულოა" };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = Date.now() + "-" + image.name.replace(/\s/g, "_");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "stories");
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    
    const imageUrl = `/uploads/stories/${filename}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.story.create({
      data: {
        userId: user.id,
        imageUrl,
        expiresAt,
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "შეცდომა ატვირთვისას" };
  }
}

export async function getStories() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        friendRequestsSent: { where: { status: "ACCEPTED" } },
        friendRequestsReceived: { where: { status: "ACCEPTED" } },
      }
    });

    if (!user) return [];

    const friendIds = [
      user.id,
      ...user.friendRequestsSent.map(f => f.friendId),
      ...user.friendRequestsReceived.map(f => f.userId)
    ];

    const stories = await prisma.story.findMany({
      where: {
        userId: { in: friendIds },
        expiresAt: { gt: new Date() } // Only active stories
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const existing = acc.find(g => g.user.id === story.user.id);
      if (existing) {
        existing.stories.push(story);
      } else {
        acc.push({
          user: story.user,
          stories: [story]
        });
      }
      return acc;
    }, [] as any[]);

    return groupedStories;
  } catch (error) {
    return [];
  }
}
