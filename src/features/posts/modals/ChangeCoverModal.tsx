"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { asyncUploadPostCover } from "../states/action";
import {
  IconX,
  IconPhoto,
  IconLoader2,
  IconUpload,
  IconTrash,
} from "@tabler/icons-react";

interface ChangeCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function ChangeCoverModal({
  isOpen,
  onClose,
  postId,
}: ChangeCoverModalProps) {
  const dispatch = useAppDispatch();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleClose = () => {
    handleRemoveCover();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coverFile) return;

    setIsLoading(true);
    const success = await dispatch(
      asyncUploadPostCover(postId, coverFile, () => {
        handleClose();
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
            Ganti Foto Sampul Postingan
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Tutup modal"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pilih Foto Sampul Baru
            </label>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="Preview Cover Baru"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition"
                  aria-label="Hapus preview cover"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="change-cover-input"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition group"
              >
                <IconPhoto
                  size={36}
                  className="text-slate-400 group-hover:text-blue-500 transition"
                />
                <span className="mt-2 text-sm font-medium text-slate-600 group-hover:text-blue-600">
                  Unggah file gambar baru
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PNG, JPG, JPEG hingga 5MB
                </span>
                <input
                  id="change-cover-input"
                  data-testid="change-cover-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !coverFile}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              {isLoading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <IconUpload size={16} />
                  <span>Unggah Sampul</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeCoverModal;
