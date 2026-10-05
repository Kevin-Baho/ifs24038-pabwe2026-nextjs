"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { getAccessToken } from "@/helpers/apiHelper";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const { isAuth, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const activeToken = token || getAccessToken();
    if (isAuth || activeToken) {
      router.replace("/");
    }
  }, [isAuth, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-center text-white">
          <h1 className="text-2xl font-bold tracking-tight">Delcom Post App</h1>
          <p className="text-blue-100 text-sm mt-1">
            Praktikum PABWE 2026 &bull; Risky Kevin Naibaho (ifs24038)
          </p>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;

