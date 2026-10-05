"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { asyncUpdatePost } from "../states/action";
import { IconX, IconLoader2, IconCheck } from "@tabler/icons-react";

interface ChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialDescription: string;
}

export function ChangeModal({
  isOpen,
  onClose,
  postId,
  initialDescription,
}: ChangeModalProps) {
  const dispatch = useAppDispatch();
  const [description, setDescription] = useState(initialDescription);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !postId) return;

    setIsLoading(true);
    const success = await dispatch(
      asyncUpdatePost(postId, description.trim(), () => {
        onClose();
      })
    );
    setIsLoading(false);
    return success;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">
            Ubah Deskripsi Postingan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Tutup modal"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Deskripsi Baru
            </label>
            <textarea
              id="edit-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Perbarui isi postingan..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              {isLoading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeModal;

