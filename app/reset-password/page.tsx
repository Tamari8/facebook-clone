"use client";

import { useState, Suspense } from "react";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMessage({ text: "პაროლები არ ემთხვევა", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    // Add token to form data
    formData.append("token", token);
    
    const result = await resetPassword(formData);
    
    if (result.success) {
      setMessage({ text: result.message, type: "success" });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setMessage({ text: result.message, type: "error" });
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col items-center pt-20 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <p className="text-red-500 font-semibold mb-4">არასწორი ბმული</p>
          <Link href="/login" className="text-[#0866ff] hover:underline">ავტორიზაციის გვერდზე დაბრუნება</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col items-center pt-20 px-4">
      <Link href="/" className="text-[#0866ff] font-bold text-4xl mb-8">facebook</Link>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">აირჩიეთ ახალი პაროლი</h2>
        <hr className="mb-4 border-gray-200 dark:border-gray-700" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          ძლიერი პაროლი შეიცავს ასოებს, ციფრებს და სიმბოლოებს.
        </p>
        
        {message && (
          <div className={`p-3 rounded mb-4 text-sm font-semibold ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="ახალი პაროლი"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-[#0866ff] mb-4"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="გაიმეორეთ პაროლი"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-[#0866ff] mb-4"
          />
          <hr className="mb-4 border-gray-200 dark:border-gray-700" />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0866ff] hover:bg-[#0759e0] disabled:bg-[#85b3ff] rounded-md font-semibold text-white transition-colors cursor-pointer"
            >
              {loading ? "ინახება..." : "პაროლის შეცვლა"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex items-center justify-center">იტვირთება...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
