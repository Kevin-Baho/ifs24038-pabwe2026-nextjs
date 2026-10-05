"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  asyncReceivePosts,
  asyncToggleLikePost,
  asyncDeletePost,
  asyncDeleteAllMyPosts,
} from "../states/action";
import { formatDate } from "@/helpers/toolsHelper";
import AddModal from "../modals/AddModal";
import {
  IconSearch,
  IconPlus,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconTrash,
  IconSparkles,
} from "@tabler/icons-react";

export function HomePage() {
  const searchParams = useSearchParams();
  const isMeParam = Boolean(searchParams?.get("is_me") === "1");

  const dispatch = useAppDispatch();
  const { posts } = useAppSelector((state) => state.posts);
  const currentUser = useAppSelector(
    (state) => state.auth.profile || state.users.profile
  );

  const [search, setSearch] = useState("");
  const [isMe, setIsMe] = useState(isMeParam);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setIsMe(isMeParam);
  }, [isMeParam]);

  useEffect(() => {
    dispatch(asyncReceivePosts(search, isMe));
  }, [dispatch, search, isMe]);

  const handleToggleLike = (postId: string) => {
    dispatch(asyncToggleLikePost(postId));
  };

  const handleDeletePost = (postId: string) => {
    dispatch(asyncDeletePost(postId));
  };

  const handleDeleteAllMine = () => {
    dispatch(asyncDeleteAllMyPosts());
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <IconSearch size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari postingan atau penulis..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMe(!isMe)}
            className={`px-3.5 py-2 text-sm font-medium rounded-xl border transition ${
              isMe
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isMe ? "Semua Postingan" : "Postingan Saya"}
          </button>

          {isMe && posts.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllMine}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
            >
              <IconTrash size={16} />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-xs transition"
          >
            <IconPlus size={18} />
            <span>Buat Post</span>
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconSparkles size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Belum ada postingan
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? "Tidak ditemukan postingan yang sesuai dengan pencarian Anda."
              : isMe
              ? "Anda belum membagikan postingan apa pun. Mulai bagikan cerita Anda!"
              : "Jadilah yang pertama membagikan cerita atau informasi di Delcom Post!"}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
          >
            <IconPlus size={18} />
            <span>Buat Postingan Baru</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isAuthor =
              currentUser &&
              (currentUser.id === post.user_id ||
                currentUser.id === post.author?.id);

            const authorName =
              post.author?.name || "Pengguna Delcom";

            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition"
              >
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-xs">
                      {post.author?.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.author.photo}
                          alt={authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        authorName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm sm:text-base">
                        {authorName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  {isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      aria-label="Hapus postingan"
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                </div>

                {post.cover && (
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover}
                      alt="Sampul postingan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 sm:p-5">
                  <p className="text-slate-800 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="px-4 sm:px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition ${
                        post.is_liked
                          ? "text-red-600"
                          : "text-slate-600 hover:text-red-600"
                      }`}
                      aria-label="Suka postingan"
                    >
                      {post.is_liked ? (
                        <IconHeartFilled size={20} className="text-red-600" />
                      ) : (
                        <IconHeart size={20} />
                      )}
                      <span>{post.total_likes}</span>
                    </button>

                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
                      aria-label="Lihat komentar"
                    >
                      <IconMessageCircle size={20} />
                      <span>{post.total_comments} Komentar</span>
                    </Link>
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Detail Post &rarr;
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;
