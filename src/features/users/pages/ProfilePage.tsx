"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  asyncReceiveProfile,
  asyncUpdateProfile,
  asyncUpdatePhoto,
  asyncUpdatePassword,
} from "../states/action";
import { useInput } from "@/hooks/useInput";
import { formatDate } from "@/helpers/toolsHelper";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconCamera,
  IconLock,
  IconCheck,
  IconLoader2,
  IconShieldLock,
} from "@tabler/icons-react";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(
    (state) => state.auth.profile || state.users.profile
  );

  const [name, handleNameChange, setName] = useInput("");
  const [oldPassword, handleOldPasswordChange, setOldPassword] = useInput("");
  const [newPassword, handleNewPasswordChange, setNewPassword] = useInput("");
  const [confirmPassword, handleConfirmPasswordChange, setConfirmPassword] =
    useInput("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!profile) {
      dispatch(asyncReceiveProfile());
    } else {
      setName(profile.name || "");
    }
  }, [dispatch, profile, setName]);

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingProfile(true);
    await dispatch(asyncUpdateProfile({ name: name.trim() }));
    setIsUpdatingProfile(false);
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdatingPhoto(true);
    await dispatch(asyncUpdatePhoto(file));
    setIsUpdatingPhoto(false);
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) return;

    setIsUpdatingPassword(true);
    await dispatch(
      asyncUpdatePassword(
        {
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        () => {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      )
    );
    setIsUpdatingPassword(false);
  };

  const displayName = profile?.name || "Risky Kevin Naibaho";
  const displayEmail = profile?.email || "ifs24038@delcom.org";

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-3xl shadow-md overflow-hidden">
            {profile?.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photo}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          <label
            htmlFor="profile-photo-input"
            className="absolute bottom-0 right-0 p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-md cursor-pointer transition transform hover:scale-105"
            title="Ganti Foto Profil"
          >
            <span className="sr-only">Unggah foto profil</span>
            {isUpdatingPhoto ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <IconCamera size={16} />
            )}
            <input
              id="profile-photo-input"
              data-testid="profile-photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUpdatingPhoto}
              className="hidden"
            />
          </label>
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
            <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-800 rounded-full border border-blue-200">
              ifs24038
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <IconMail size={16} className="text-slate-600" />
              <span>{displayEmail}</span>
            </div>
            {profile?.created_at && (
              <div className="flex items-center gap-1.5">
                <IconCalendar size={16} className="text-slate-600" />
                <span>Bergabung {formatDate(profile.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <IconUser size={20} className="text-blue-700" />
            <h3 className="font-bold text-slate-900">Perbarui Informasi</h3>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-bold text-slate-800 mb-1"
              >
                Nama Lengkap
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Nama Lengkap"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm text-slate-900 transition"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email-readonly"
                className="block text-sm font-bold text-slate-800 mb-1"
              >
                Email (Tidak dapat diubah)
              </label>
              <input
                id="profile-email-readonly"
                type="email"
                readOnly
                value={displayEmail}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm outline-none cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold text-sm rounded-xl transition shadow-xs cursor-pointer"
            >
              {isUpdatingProfile ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  <span>Simpan Perubahan Nama</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <IconShieldLock size={20} className="text-blue-700" />
            <h3 className="font-bold text-slate-900">Keamanan & Sandi</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label
                htmlFor="old-password"
                className="block text-sm font-bold text-slate-800 mb-1"
              >
                Kata Sandi Saat Ini
              </label>
              <input
                id="old-password"
                type="password"
                required
                value={oldPassword}
                onChange={handleOldPasswordChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm text-slate-900 transition"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-bold text-slate-800 mb-1"
              >
                Kata Sandi Baru
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm text-slate-900 transition"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-bold text-slate-800 mb-1"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm text-slate-900 transition"
              />
            </div>

            <button
              type="submit"
              disabled={
                isUpdatingPassword ||
                !oldPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition shadow-xs cursor-pointer"
            >
              {isUpdatingPassword ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <>
                  <IconLock size={16} />
                  <span>Perbarui Kata Sandi</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;