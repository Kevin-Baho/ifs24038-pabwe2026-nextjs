"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncReceiveUsers } from "../states/action";
import { formatDate } from "@/helpers/toolsHelper";
import { IconSearch, IconUsers, IconMail, IconCalendar } from "@tabler/icons-react";

export function UsersPage() {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(asyncReceiveUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Daftar Pengguna</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Komunitas pengguna aktif di Delcom Post
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <IconSearch size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <IconUsers size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            Pengguna tidak ditemukan
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Coba sesuaikan kata kunci pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-xs overflow-hidden mb-3">
                {user.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>

              <h3 className="font-bold text-slate-800 text-base">{user.name}</h3>

              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <IconMail size={14} className="text-slate-400" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>

              {user.created_at && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                  <IconCalendar size={13} />
                  <span>Bergabung {formatDate(user.created_at)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersPage;
