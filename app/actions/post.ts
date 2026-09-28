"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ---- POSTS ----

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "არ ხართ ავტორიზებული!" };

  const content = formData.get("content") as string;
  const image = formData.get("image") as File | null;
  
  if (!content && (!image || image.size === 0)) {
    return { success: false, message: "პოსტის ტექსტი ან ფოტო სავალდებულოა!" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, message: "მომხმარებელი ვერ მოიძებნა!" };

    let imageUrl = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = Date.now() + "-" + image.name.replace(/\s/g, "_");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      
      imageUrl = `/uploads/${filename}`;
    }

    await prisma.post.create({
      data: {
        content: content || "",
        imageUrl,
        authorId: user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create Post Error:", error);
    return { success: false, message: "პოსტის დამატება ვერ მოხერხდა." };
  }
}

export async function editPost(postId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    
    if (!user || !post || post.authorId !== user.id) return { success: false };

    await prisma.post.update({
      where: { id: postId },
      data: { content },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "არ ხართ ავტორიზებული!" };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!user || !post || post.authorId !== user.id) {
      return { success: false, message: "თქვენ არ გაქვთ წაშლის უფლება!" };
    }

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "წაშლა ვერ მოხერხდა." };
  }
}

export async function getPosts() {
  const session = await getServerSession(authOptions);
  
  try {
    let authorIds: string[] | undefined = undefined;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          friendRequestsSent: { where: { status: "ACCEPTED" } },
          friendRequestsReceived: { where: { status: "ACCEPTED" } },
        }
      });
      
      if (user) {
        // Collect IDs of accepted friends + current user
        authorIds = [
          user.id,
          ...user.friendRequestsSent.map(f => f.friendId),
          ...user.friendRequestsReceived.map(f => f.userId)
        ];
      }
    }

    const posts = await prisma.post.findMany({
      where: authorIds ? { authorId: { in: authorIds } } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        likes: { select: { userId: true, type: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          },
          orderBy: { createdAt: "asc" }
        },
      },
    });
    return posts;
  } catch (error) {
    console.error("Get Posts Error:", error);
    return [];
  }
}


// ---- LIKES & COMMENTS ----

export async function toggleLike(postId: string, type: string = "LIKE") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        }
      }
    });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (existingLike) {
      if (existingLike.type === type) {
        await prisma.like.delete({ where: { id: existingLike.id } });
      } else {
        await prisma.like.update({ where: { id: existingLike.id }, data: { type } });
      }
    } else {
      await prisma.like.create({ data: { userId: user.id, postId: postId, type } });
      if (post && post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            actorId: user.id,
            type: "LIKE",
            postId: postId
          }
        });
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addComment(postId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false };

    await prisma.comment.create({
      data: {
        text,
        userId: user.id,
        postId,
      }
    });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: user.id,
          type: "COMMENT",
          postId: postId
        }
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function editComment(commentId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    
    if (!user || !comment || comment.userId !== user.id) return { success: false };

    await prisma.comment.update({
      where: { id: commentId },
      data: { text },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!user || !comment || comment.userId !== user.id) return { success: false };

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
