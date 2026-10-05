"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/hooks/redux";
import { asyncDeleteAllMyPosts } from "../states/action";
import {
  IconHome,
  IconArticle,
  IconUsers,
  IconUser,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

interface SidebarComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarComponent({
  isOpen = false,
  onClose,
}: SidebarComponentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isMeParam = searchParams?.get("me") === "true";

  const handleDeleteAll = () => {
    dispatch(asyncDeleteAllMyPosts());
  };

  const navItems = [
    {
      label: "Beranda",
      href: "/",
      icon: IconHome,
      isActive: pathname === "/" && !isMeParam,
    },
    {
      label: "Postingan Saya",
      href: "/?me=true",
      icon: IconArticle,
      isActive: pathname === "/" && isMeParam,
    },
    {
      label: "Daftar Pengguna",
      href: "/users",
      icon: IconUsers,
      isActive: pathname === "/users",
    },
    {
      label: "Profil Saya",
      href: "/profile",
      icon: IconUser,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
            <span className="font-bold text-slate-800">Menu Navigasi</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Tutup sidebar"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                    item.isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      item.isActive ? "text-blue-600" : "text-slate-400"
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Aksi Cepat
              </div>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition"
              >
                <IconTrash size={20} className="text-red-500" />
                <span>Hapus Semua Post</span>
              </button>
            </div>
          </div>

          {/* User / App Footer */}
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            Delcom Post © 2026
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;

