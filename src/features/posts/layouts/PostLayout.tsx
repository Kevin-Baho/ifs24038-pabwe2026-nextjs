"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { getAccessToken } from "@/helpers/apiHelper";
import { asyncReceiveProfile } from "@/features/users/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

interface PostLayoutProps {
  children: ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const activeToken = token || getAccessToken();
    if (!activeToken) {
      router.replace("/auth/login");
      return;
    }

    if (!profile) {
      dispatch(asyncReceiveProfile());
    }
    setIsCheckingAuth(false);
  }, [token, profile, dispatch, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        <SidebarComponent
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default PostLayout;

