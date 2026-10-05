"use client";

import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  asyncReceivePostDetail,
  asyncToggleLikePost,
  asyncAddComment,
  asyncDeleteComment,
  asyncDeletePost,
  clearDetailPostAction,
} from "../states/action";
import { formatDate } from "@/helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconTrash,
  IconEdit,
  IconPhoto,
  IconSend,
  IconLoader2,
} from "@tabler/icons-react";

export function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = (params?.postId as string) || "";

  const dispatch = useAppDispatch();
  const { detailPost } = useAppSelector((state) => state.posts);
  const currentUser = useAppSelector(
    (state) => state.auth.profile || state.users.profile
  );

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  useEffect(() => {
    if (postId) {
      dispatch(asyncReceivePostDetail(postId));
    }
    return () => {
      dispatch(clearDetailPostAction());
    };
  }, [dispatch, postId]);

  const handleToggleLike = () => {
    dispatch(asyncToggleLikePost(postId));
  };

  const handleDeletePost = () => {
    dispatch(
      asyncDeletePost(postId, () => {
        router.push("/");
      })
    );
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    await dispatch(
      asyncAddComment(postId, commentText.trim(), () => {
        setCommentText("");
      })
    );
    setIsSubmittingComment(false);
  };

  const handleDeleteComment = (commentId: string) => {
    dispatch(asyncDeleteComment(postId, commentId));
  };

  if (!detailPost) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <IconLoader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
        <p className="text-slate-600 text-sm">Memuat detail postingan...</p>
      </div>
    );
  }

  const isAuthor =
    currentUser &&
    (currentUser.id === detailPost.user_id ||
      currentUser.id === detailPost.author?.id);

  const authorName = detailPost.author?.name || "Pengguna Delcom";

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
        >
          <IconArrowLeft size={18} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base overflow-hidden shadow-xs">
              {detailPost.author?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detailPost.author.photo}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                {authorName}
              </h2>
              <div className="text-xs text-slate-400">
                {formatDate(detailPost.created_at)}
              </div>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                aria-label="Edit deskripsi"
              >
                <IconEdit size={16} />
                <span className="hidden sm:inline">Ubah Deskripsi</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
                aria-label="Ganti cover"
              >
                <IconPhoto size={16} />
                <span className="hidden sm:inline">Ubah Cover</span>
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                aria-label="Hapus postingan"
              >
                <IconTrash size={16} />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          )}
        </div>

        {detailPost.cover && (
          <div className="aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100 max-h-[480px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={detailPost.cover}
              alt="Sampul postingan"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <p className="text-slate-800 text-base leading-relaxed whitespace-pre-line">
            {detailPost.description}
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-6">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              detailPost.is_liked
                ? "text-red-600"
                : "text-slate-600 hover:text-red-600"
            }`}
            aria-label="Suka postingan"
          >
            {detailPost.is_liked ? (
              <IconHeartFilled size={22} className="text-red-600" />
            ) : (
              <IconHeart size={22} />
            )}
            <span>{detailPost.total_likes} Suka</span>
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <IconMessageCircle size={22} />
            <span>{detailPost.total_comments} Komentar</span>
          </div>
        </div>
      </article>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>Komentar</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {(detailPost.comments || []).length}
          </span>
        </h3>

        <form onSubmit={handleCommentSubmit} className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex shrink-0 items-center justify-center font-bold text-sm overflow-hidden">
            {currentUser?.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.photo}
                alt={currentUser.name || "Pengguna"}
                className="w-full h-full object-cover"
              />
            ) : (
              (currentUser?.name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tuliskan komentar Anda..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-xl shadow-xs transition"
            >
              {isSubmittingComment ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : (
                <IconSend size={18} />
              )}
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </form>

        <div className="space-y-3 pt-2">
          {(detailPost.comments || []).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
            </p>
          )}

          {detailPost.comments?.map((comment) => {
            const commentAuthorName =
              comment.author?.name || "Pengguna Delcom";
            const commentAuthorPhoto = comment.author?.photo;

            const isCommentOwner = Boolean(
              currentUser &&
                (currentUser.id === comment.user_id ||
                  currentUser.id === detailPost.user_id)
            );

            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex shrink-0 items-center justify-center font-semibold text-xs overflow-hidden">
                    {commentAuthorPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={commentAuthorPhoto}
                        alt={commentAuthorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      commentAuthorName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800">
                        {commentAuthorName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 leading-snug">
                      {comment.comment}
                    </p>
                  </div>
                </div>

                {isCommentOwner && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition"
                    aria-label="Hapus komentar"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ChangeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        postId={detailPost.id}
        initialDescription={detailPost.description}
      />

      <ChangeCoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        postId={detailPost.id}
      />
    </div>
  );
}

export default DetailPage;
