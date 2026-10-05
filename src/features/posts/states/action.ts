import { ActionType } from "@/types/action";
import { CreatePostPayload, Post, PostComment } from "@/types";
import { postApi } from "../api/postApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";
import { AppDispatch, RootState } from "@/store";

export function receivePostsAction(posts: Post[]) {
  return {
    type: ActionType.POSTS_RECEIVE,
    payload: { posts },
  };
}

export function receivePostDetailAction(post: Post) {
  return {
    type: ActionType.POST_DETAIL_RECEIVE,
    payload: { post },
  };
}

export function clearDetailPostAction() {
  return {
    type: ActionType.POST_CLEAR_DETAIL,
  };
}

export function addPostAction(post: Post) {
  return {
    type: ActionType.POST_ADD,
    payload: { post },
  };
}

export function updatePostAction(post: Post) {
  return {
    type: ActionType.POST_UPDATE,
    payload: { post },
  };
}

export function deletePostAction(id: string) {
  return {
    type: ActionType.POST_DELETE,
    payload: { id },
  };
}

export function toggleLikePostAction(
  id: string,
  isLiked: boolean,
  totalLikes?: number
) {
  return {
    type: ActionType.POST_TOGGLE_LIKE,
    payload: { id, isLiked, totalLikes },
  };
}

export function addCommentAction(postId: string, comment: PostComment) {
  return {
    type: ActionType.POST_ADD_COMMENT,
    payload: { postId, comment },
  };
}

export function deleteCommentAction(postId: string, commentId: string) {
  return {
    type: ActionType.POST_DELETE_COMMENT,
    payload: { postId, commentId },
  };
}

export function deleteAllMyPostsAction() {
  return {
    type: ActionType.POSTS_DELETE_ALL_MINE,
  };
}

export function asyncReceivePosts(search?: string, isMe?: boolean) {
  return async (dispatch: AppDispatch) => {
    const result = await postApi.getPosts(search, isMe);
    if (result.success && result.data?.posts) {
      dispatch(receivePostsAction(result.data.posts));
      return result.data.posts;
    } else {
      await showErrorDialog(result.message || "Gagal memuat daftar postingan.");
      return [];
    }
  };
}

export function asyncReceivePostDetail(id: string) {
  return async (dispatch: AppDispatch) => {
    const result = await postApi.getPostById(id);
    if (result.success && result.data?.post) {
      dispatch(receivePostDetailAction(result.data.post));
      return result.data.post;
    } else {
      await showErrorDialog(result.message || "Gagal memuat detail postingan.");
      return null;
    }
  };
}

export function asyncCreatePost(
  payload: CreatePostPayload,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const result = await postApi.createPost(payload);
    if (result.success) {
      if (result.data?.post) {
        dispatch(addPostAction(result.data.post));
      } else {
        await dispatch(asyncReceivePosts());
      }
      await showSuccessDialog("Postingan berhasil dibuat!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal membuat postingan.");
      return false;
    }
  };
}

export function asyncUpdatePost(
  id: string,
  description: string,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const result = await postApi.updatePost(id, description);
    if (result.success && result.data?.post) {
      dispatch(updatePostAction(result.data.post));
      await showSuccessDialog("Postingan berhasil diperbarui!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal memperbarui postingan.");
      return false;
    }
  };
}

export function asyncUploadPostCover(
  id: string,
  cover: File,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const result = await postApi.uploadPostCover(id, cover);
    if (result.success) {
      await dispatch(asyncReceivePostDetail(id));
      await showSuccessDialog("Foto sampul berhasil diunggah!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal mengunggah cover postingan.");
      return false;
    }
  };
}

export function asyncDeletePost(id: string, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    const confirmed = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return false;

    const result = await postApi.deletePost(id);
    if (result.success) {
      dispatch(deletePostAction(id));
      await showSuccessDialog("Postingan berhasil dihapus!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal menghapus postingan.");
      return false;
    }
  };
}

export function asyncToggleLikePost(id: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const currentPost =
      state.posts.detailPost?.id === id
        ? state.posts.detailPost
        : state.posts.posts.find((p) => p.id === id);

    const prevLiked = currentPost ? currentPost.is_liked : false;
    const prevCount = currentPost ? currentPost.total_likes : 0;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    dispatch(toggleLikePostAction(id, nextLiked, nextCount));

    const result = await postApi.toggleLikePost(id);
    if (!result.success) {
      dispatch(toggleLikePostAction(id, prevLiked, prevCount));
      await showErrorDialog(result.message || "Gagal memperbarui suka.");
      return false;
    } else if (result.data?.is_liked !== undefined) {
      dispatch(
        toggleLikePostAction(
          id,
          result.data.is_liked,
          result.data.total_likes ?? nextCount
        )
      );
    }
    return true;
  };
}

export function asyncAddComment(
  postId: string,
  comment: string,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const result = await postApi.addComment(postId, comment);
    if (result.success && result.data?.comment) {
      dispatch(addCommentAction(postId, result.data.comment));
      await showSuccessDialog("Komentar berhasil ditambahkan!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal menambahkan komentar.");
      return false;
    }
  };
}

export function asyncDeleteComment(
  postId: string,
  commentId: string,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const confirmed = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus komentar ini?"
    );
    if (!confirmed) return false;

    const result = await postApi.deleteComment(postId, commentId);
    if (result.success) {
      dispatch(deleteCommentAction(postId, commentId));
      await showSuccessDialog("Komentar berhasil dihapus!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal menghapus komentar.");
      return false;
    }
  };
}

export function asyncDeleteAllMyPosts(onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    const confirmed = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus SEMUA postingan Anda? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmed) return false;

    const result = await postApi.deleteAllMyPosts();
    if (result.success) {
      dispatch(deleteAllMyPostsAction());
      await showSuccessDialog("Semua postingan Anda telah berhasil dibersihkan!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal menghapus semua postingan.");
      return false;
    }
  };
}
