"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ---- PROFILE ----

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "არ ხართ ავტორიზებული!" };

  const bio = formData.get("bio") as string;
  const image = formData.get("image") as File | null;

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    let imageUrl = user.image;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = Date.now() + "-" + image.name.replace(/\s/g, "_");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      
      imageUrl = `/uploads/${filename}`;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: bio !== null ? bio : user.bio,
        image: imageUrl,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, message: "პროფილის განახლება ვერ მოხერხდა." };
  }
}

// ---- FRIENDS ----

export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) return [];

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  try {
    const users = await prisma.user.findMany({
      where: {
        name: { contains: query },
        email: { not: session.user.email },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        image: true,
      }
    });
    return users;
  } catch (error) {
    return [];
  }
}

export async function sendFriendRequest(friendId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.id === friendId) return { success: false };

    // Check if reverse request exists
    const existingReverse = await prisma.friendship.findFirst({
      where: { userId: friendId, friendId: user.id }
    });

    if (existingReverse) {
      // Auto accept if they already requested us
      await prisma.friendship.update({
        where: { id: existingReverse.id },
        data: { status: "ACCEPTED" }
      });

      // Notify the requester that their request was accepted
      try {
        await prisma.notification.create({
          data: {
            userId: friendId,
            actorId: user.id,
            type: "FRIEND_ACCEPTED"
          }
        });
      } catch (e) {
        console.error("Failed to create friend acceptance notification:", e);
      }
    } else {
      await prisma.friendship.create({
        data: {
          userId: user.id,
          friendId: friendId,
          status: "PENDING",
        }
      });

      try {
        await prisma.notification.create({
          data: {
            userId: friendId,
            actorId: user.id,
            type: "FRIEND_REQUEST"
          }
        });
      } catch (e) {
        console.error("Failed to create friend request notification:", e);
      }
    }

    revalidatePath("/");
    revalidatePath("/friends");
    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function removeFriend(friendId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: user.id, friendId: friendId },
          { userId: friendId, friendId: user.id }
        ]
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
