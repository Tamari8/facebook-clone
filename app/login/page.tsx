"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("არასწორი ელ.ფოსტა ან პაროლი!");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#18191A] p-4 select-none">
      <div className="w-full max-w-[980px] flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
        {/* Left Branding Column */}
        <div className="text-center md:text-left md:max-w-[500px]">
          <h1 className="text-5xl sm:text-6xl font-black text-[#0866FF] tracking-tight">
            facebook
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-[#1C1E21] dark:text-[#E4E6EB] leading-snug font-normal">
            Facebook გეხმარებათ დაუკავშირდეთ და გაუზიაროთ სიახლეები თქვენს ცხოვრებაში მყოფ ადამიანებს.
          </p>
        </div>

        {/* Right Form Card Column */}
        <div className="w-full max-w-[400px]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-2xl bg-white dark:bg-[#242526] p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm p-3 rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            <input
              type="email"
              name="email"
              placeholder="ელ.ფოსტა ან ტელეფონის ნომერი"
              className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3.5 text-base focus:border-[#0866FF] focus:outline-none transition-colors"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="პაროლი"
              className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#3A3B3C] text-[#050505] dark:text-white p-3.5 text-base focus:border-[#0866FF] focus:outline-none transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#0866FF] hover:bg-[#0759E0] py-3 text-xl font-bold text-white transition duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "მიმდინარეობს..." : "შესვლა"}
            </button>

            <Link href="/forgot-password" className="text-center text-sm font-medium text-[#0866FF] hover:underline">
              დაგავიწყდათ პაროლი?
            </Link>

            <hr className="my-1 border-gray-200 dark:border-gray-700" />

            <Link
              href="/register"
              className="mx-auto w-fit rounded-xl bg-[#42B72A] hover:bg-[#36A420] px-5 py-3 text-base font-bold text-white transition duration-200 text-center cursor-pointer shadow-sm"
            >
              ახალი ანგარიშის შექმნა
            </Link>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <strong>შექმენით გვერდი</strong> ცნობილი ადამიანისთვის, ბრენდისთვის ან ბიზნესისთვის.
          </p>
        </div>
      </div>
    </div>
  );
}
