"use client";

import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await registerUser(formData);

    if (result.success) {
      // Automatically log the user in
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#18191A] p-4 select-none">
      <div className="w-full max-w-[440px] rounded-2xl bg-white dark:bg-[#242526] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <Link href="/" className="text-5xl font-black text-[#0866FF] tracking-tight hover:opacity-95">
            facebook
          </Link>
          <h2 className="text-2xl font-bold text-[#050505] dark:text-[#E4E6EB] mt-3">
            ახალი ანგარიშის შექმნა
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            სწრაფი და მარტივი რეგისტრაცია.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm p-3 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              name="name"
              placeholder="სახელი"
              className="w-1/2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3.5 focus:border-[#0866FF] focus:outline-none transition-colors text-[15px]"
              required
            />
            <input
              type="text"
              name="lastname"
              placeholder="გვარი"
              className="w-1/2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3.5 focus:border-[#0866FF] focus:outline-none transition-colors text-[15px]"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="ელ.ფოსტა"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3.5 focus:border-[#0866FF] focus:outline-none transition-colors text-[15px]"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="ახალი პაროლი (მინ. 6 სიმბოლო)"
            minLength={6}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3.5 focus:border-[#0866FF] focus:outline-none transition-colors text-[15px]"
            required
          />

          <p className="text-[12px] text-gray-500 dark:text-gray-400 py-1 leading-normal">
            დარეგისტრირებით თქვენ ეთანხმებით ჩვენს <span className="text-[#0866FF] cursor-pointer hover:underline">პირობებს</span>, <span className="text-[#0866FF] cursor-pointer hover:underline">კონფიდენციალურობის პოლიტიკას</span> და <span className="text-[#0866FF] cursor-pointer hover:underline">ქუქიების გამოყენებას</span>.
          </p>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-[#42B72A] hover:bg-[#36A420] text-white py-3 text-lg font-bold transition duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? "რეგისტრაცია..." : "რეგისტრაცია"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link href="/login" className="text-sm font-semibold text-[#0866FF] hover:underline">
            უკვე გაქვთ ანგარიში? შესვლა
          </Link>
        </div>
      </div>
    </div>
  );
}
