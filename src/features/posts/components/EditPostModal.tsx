"use client";

import { useState, useEffect, FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import { useAppDispatch } from "@/hooks/redux";
import { updatePost } from "../states/postSlice";
import { Post } from "@/types";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

export default function EditPostModal({ isOpen, onClose, post }: EditPostModalProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
    }
  }, [post]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!post || !title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await dispatch(updatePost({ id: post.id, title: title.trim(), content: content.trim() })).unwrap();
      onClose();
    } catch (error) {
      console.error("Gagal memperbarui postingan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Postingan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-slate-300 mb-1">
            Judul
          </label>
          <input
            id="edit-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 text-sm"
          />
        </div>
        <div>
          <label htmlFor="edit-content" className="block text-sm font-medium text-slate-300 mb-1">
            Konten
          </label>
          <textarea
            id="edit-content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 resize-none text-sm"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}