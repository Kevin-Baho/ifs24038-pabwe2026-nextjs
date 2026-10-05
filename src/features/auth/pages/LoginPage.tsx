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
    
    // Sesuaikan parameter dispatch sesuai dengan action asyncLogin milik Posts App (NextJS)
    const success = await dispatch(
      asyncLogin({ email, password }, () => {
        router.push("/");
      })
    );
    
    setIsLoading(false);
    
    // Fallback jika tidak ada callback fungsi di dalam action
    if (success === true) {
      router.push("/");
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Masuk ke Akun Anda</h2>
        <p className="text-sm text-slate-500 mt-1">
          Masukkan email dan kata sandi untuk melanjutkan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email-input"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
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
          <label
            htmlFor="login-password-input"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
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
        <Link
          href="/auth/register"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;