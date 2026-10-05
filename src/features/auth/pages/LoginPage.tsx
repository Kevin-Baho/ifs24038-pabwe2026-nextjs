"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/redux";
import { useInput } from "@/hooks/useInput";
import { asyncLogin } from "../states/action";
import { IconMail, IconLock, IconLogin, IconLoader2 } from "@tabler/icons-react";

export function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, handleEmailChange] = useInput("");
  const [password, handlePasswordChange] = useInput("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    const success = await dispatch(
      asyncLogin({ email, password }, () => {
        router.push("/");
      })
    );
    setIsLoading(false);
    
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-center text-white">
          <h1 className="text-2xl font-bold tracking-tight">Delcom Post App</h1>
          <p className="text-blue-100 text-sm mt-1">
            Masuk ke Akun Anda
          </p>
        </div>
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email-input" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IconMail size={18} />
                </div>
                <input
                  id="login-email-input"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password-input" className="block text-sm font-medium text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IconLock size={18} />
                </div>
                <input
                  id="login-password-input"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 mt-2 shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="animate-spin" size={18} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <IconLogin size={18} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Belum memiliki akun?{" "}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;