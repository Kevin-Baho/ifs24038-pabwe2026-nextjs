"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncLogout } from "@/features/auth/states/action";
import { IconLogout, IconMenu2, IconUser, IconSparkles } from "@tabler/icons-react";

interface NavbarComponentProps {
  onToggleSidebar?: () => void;
}

export function NavbarComponent({ onToggleSidebar }: NavbarComponentProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.auth);
  const userProfile = useAppSelector((state) => state.users.profile);
  const currentUser = profile || userProfile;

  const handleLogout = async () => {
    await dispatch(
      asyncLogout(() => {
        router.push("/auth/login");
      })
    );
  };

  const displayName = currentUser?.name || "Risky Kevin Naibaho";
  const displayEmail = currentUser?.email || "ifs24038@delcom.org";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition"
              aria-label="Toggle navigation menu"
            >
              <IconMenu2 size={20} />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition">
                <IconSparkles size={20} />
              </div>
              <span className="font-bold text-lg text-slate-800 tracking-tight">
                Delcom<span className="text-blue-600">Post</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition group"
              aria-label="Lihat profil"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                {currentUser?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.photo}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate max-w-[130px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {displayEmail}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
              aria-label="Keluar dari akun"
              title="Keluar"
            >
              <IconLogout size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavbarComponent;

