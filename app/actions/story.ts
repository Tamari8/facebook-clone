"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createStory(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "არ ხართ ავტორიზებული" };

  const image = formData.get("image") as File | null;
  const textStory = formData.get("text") as string | null;
  const bgColor = (formData.get("bgColor") as string) || "linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)";

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, message: "მომხმარებელი ვერ მოიძებნა" };

    let imageUrl = "";

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = image.type || "image/jpeg";
      imageUrl = `data:${mimeType};base64,${base64}`;
    } else if (textStory && textStory.trim()) {
      const escapedText = textStory.trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0866FF"/>
            <stop offset="50%" stop-color="#A033FF"/>
            <stop offset="100%" stop-color="#FF007A"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="${bgColor.includes('gradient') ? 'url(#grad)' : bgColor}"/>
        <foreignObject x="80" y="300" width="920" height="1320">
          <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;color:white;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:68px;font-weight:bold;line-height:1.4;word-break:break-word;padding:24px;">
            ${escapedText}
          </div>
        </foreignObject>
      </svg>`;
      imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } else {
      return { success: false, message: "ფოტო ან ტექსტი სავალდებულოა" };
    }

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
    console.error("Story Create Error:", error);
    return { success: false, message: "შეცდომა ისტორიის დამატებისას" };
  }
}

export async function deleteStory(storyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { success: false };

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story || story.userId !== user.id) {
    return { success: false, message: "უფლება არ გაქვთ" };
  }

  await prisma.story.delete({ where: { id: storyId } });
  revalidatePath("/");
  return { success: true };
}

export async function reactToStory(storyId: string, emoji: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { success: false };

  await prisma.storyReaction.upsert({
    where: {
      storyId_userId: {
        storyId,
        userId: user.id,
      }
    },
    update: { emoji },
    create: {
      storyId,
      userId: user.id,
      emoji,
    }
  });

  revalidatePath("/");
  return { success: true, emoji };
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
        expiresAt: { gt: new Date() }
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        reactions: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        }
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
