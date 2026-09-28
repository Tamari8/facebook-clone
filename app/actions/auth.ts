"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const lastname = formData.get("lastname") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "ელ.ფოსტა და პაროლი სავალდებულოა!" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "მომხმარებელი ამ ელ.ფოსტით უკვე არსებობს!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = name && lastname ? `${name} ${lastname}` : name || "უცნობი მომხმარებელი";
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

    await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        image: avatarUrl,
      },
    });

    return { success: true, message: "რეგისტრაცია წარმატებით დასრულდა!" };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, message: "დაფიქსირდა შეცდომა რეგისტრაციისას." };
  }
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { success: false, message: "ელ.ფოსტა სავალდებულოა!" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: false, message: "მომხმარებელი არ მოიძებნა!" };

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const { sent } = await sendPasswordResetEmail(email, resetUrl);

  return { 
    success: true, 
    message: sent 
      ? "პაროლის აღდგენის ბმული გამოგზავნილია თქვენს ელ.ფოსტაზე!" 
      : "პაროლის აღდგენის ბმული გაგზავნილია (თუ SMTP არ გაქვთ ჩაწერილი, იხილეთ ტერმინალში)." 
  };
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) return { success: false, message: "პაროლი სავალდებულოა!" };

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { success: false, message: "ბმული ვადაგასულია ან არასწორია!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return { success: true, message: "პაროლი წარმატებით შეიცვალა!" };
}
