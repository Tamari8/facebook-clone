"use client";

import { useState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);
    
    if (result.success) {
      setMessage({ text: result.message, type: "success" });
    } else {
      setMessage({ text: result.message, type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col items-center pt-20 px-4">
      <Link href="/" className="text-[#0866ff] font-bold text-4xl mb-8">facebook</Link>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">იპოვე შენი ანგარიში</h2>
        <hr className="mb-4 border-gray-200 dark:border-gray-700" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          გთხოვთ შეიყვანოთ თქვენი ელ.ფოსტის მისამართი ანგარიშის მოსაძებნად.
        </p>
        
        {message && (
          <div className={`p-3 rounded mb-4 text-sm font-semibold ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="ელ.ფოსტა"
            required
            className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-[#0866ff] mb-4"
          />
          <hr className="mb-4 border-gray-200 dark:border-gray-700" />
          <div className="flex justify-end gap-2">
            <Link href="/login" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md font-semibold text-gray-700 dark:text-white transition-colors">
              გაუქმება
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0866ff] hover:bg-[#0759e0] disabled:bg-[#85b3ff] rounded-md font-semibold text-white transition-colors"
            >
              {loading ? "იგზავნება..." : "ძიება"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
