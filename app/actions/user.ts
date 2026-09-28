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

  const bio = formData.get("bio") as string | null;
  const image = formData.get("image") as File | null;
  const coverImage = formData.get("coverImage") as File | null;
  const removeImage = formData.get("removeImage") === "true";
  const removeCover = formData.get("removeCover") === "true";

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    let imageUrl = user.image;
    if (removeImage) {
      imageUrl = null;
    } else if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mime = image.type || "image/jpeg";
      imageUrl = `data:${mime};base64,${base64}`;
    }

    let coverUrl = user.coverImage;
    if (removeCover) {
      coverUrl = null;
    } else if (coverImage && coverImage.size > 0) {
      const bytes = await coverImage.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mime = coverImage.type || "image/jpeg";
      coverUrl = `data:${mime};base64,${base64}`;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: bio !== null ? bio : user.bio,
        image: imageUrl,
        coverImage: coverUrl,
      },
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, message: "პროფილის განახლება ვერ მოხერხდა." };
  }
}

export async function updateCoverPhoto(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  const file = formData.get("coverImage") as File | null;
  if (!file || file.size === 0) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mime = file.type || "image/jpeg";
    const coverUrl = `data:${mime};base64,${base64}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { coverImage: coverUrl },
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

export async function deleteProfilePhoto() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

export async function deleteCoverPhoto() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    await prisma.user.update({
      where: { id: user.id },
      data: { coverImage: null },
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
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
