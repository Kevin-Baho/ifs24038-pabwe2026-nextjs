import { describe, it, expect, vi, beforeEach } from "vitest";
import * as actions from "./action";
import { ActionType } from "@/types/action";
import { postApi } from "../api/postApi";
import * as toolsHelper from "@/helpers/toolsHelper";
import { Post } from "@/types";

describe("posts actions and thunks", () => {
  const dummyPost: Post = {
    id: "post-1",
    user_id: "user-1",
    author: { id: "user-1", name: "Risky" },
    description: "Sample post",
    cover: null,
    total_likes: 0,
    is_liked: false,
    total_comments: 0,
    comments: [],
    created_at: "2026-10-04T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue(true as any);
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue(true as any);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true as any);
  });

  it("creates sync action objects correctly", () => {
    expect(actions.receivePostsAction([dummyPost])).toEqual({
      type: ActionType.POSTS_RECEIVE,
      payload: { posts: [dummyPost] },
    });

    expect(actions.receivePostDetailAction(dummyPost)).toEqual({
      type: ActionType.POST_DETAIL_RECEIVE,
      payload: { post: dummyPost },
    });

    expect(actions.clearDetailPostAction()).toEqual({
      type: ActionType.POST_CLEAR_DETAIL,
    });

    expect(actions.addPostAction(dummyPost)).toEqual({
      type: ActionType.POST_ADD,
      payload: { post: dummyPost },
    });

    expect(actions.updatePostAction(dummyPost)).toEqual({
      type: ActionType.POST_UPDATE,
      payload: { post: dummyPost },
    });

    expect(actions.deletePostAction("post-1")).toEqual({
      type: ActionType.POST_DELETE,
      payload: { id: "post-1" },
    });

    expect(actions.toggleLikePostAction("post-1", true, 5)).toEqual({
      type: ActionType.POST_TOGGLE_LIKE,
      payload: { id: "post-1", isLiked: true, totalLikes: 5 },
    });

    const dummyComment = {
      id: "comm-1",
      comment: "Nice",
      created_at: "2026-10-04T12:00:00.000Z",
    };
    expect(actions.addCommentAction("post-1", dummyComment)).toEqual({
      type: ActionType.POST_ADD_COMMENT,
      payload: { postId: "post-1", comment: dummyComment },
    });

    expect(actions.deleteCommentAction("post-1", "comm-1")).toEqual({
      type: ActionType.POST_DELETE_COMMENT,
      payload: { postId: "post-1", commentId: "comm-1" },
    });

    expect(actions.deleteAllMyPostsAction()).toEqual({
      type: ActionType.POSTS_DELETE_ALL_MINE,
    });
  });

  describe("asyncReceivePosts", () => {
    it("dispatches receivePostsAction on success", async () => {
      vi.spyOn(postApi, "getPosts").mockResolvedValue({
        success: true,
        data: { posts: [dummyPost] },
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncReceivePosts("test", true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        actions.receivePostsAction([dummyPost])
      );
      expect(result).toEqual([dummyPost]);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(postApi, "getPosts").mockResolvedValue({
        success: false,
        message: "Error fetching",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncReceivePosts()(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Error fetching");
      expect(result).toEqual([]);
    });

    it("handles failure with default message when message is not provided", async () => {
      vi.spyOn(postApi, "getPosts").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncReceivePosts()(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal memuat daftar postingan."
      );
    });
  });

  describe("asyncReceivePostDetail", () => {
    it("dispatches receivePostDetailAction on success", async () => {
      vi.spyOn(postApi, "getPostById").mockResolvedValue({
        success: true,
        data: { post: dummyPost },
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncReceivePostDetail("post-1")(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        actions.receivePostDetailAction(dummyPost)
      );
      expect(result).toEqual(dummyPost);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(postApi, "getPostById").mockResolvedValue({
        success: false,
        message: "Not found",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncReceivePostDetail("post-1")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Not found");
      expect(result).toBeNull();
    });

    it("handles failure with default message", async () => {
      vi.spyOn(postApi, "getPostById").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncReceivePostDetail("post-1")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal memuat detail postingan."
      );
    });
  });

  describe("asyncCreatePost", () => {
    it("dispatches addPostAction when result.data.post is returned", async () => {
      vi.spyOn(postApi, "createPost").mockResolvedValue({
        success: true,
        data: { post: dummyPost },
      } as any);

      const dispatch = vi.fn();
      const onSuccess = vi.fn();

      const result = await actions.asyncCreatePost(
        { description: "Test" },
        onSuccess
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.addPostAction(dummyPost));
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Postingan berhasil dibuat!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("dispatches asyncReceivePosts when result.data.post is missing", async () => {
      vi.spyOn(postApi, "createPost").mockResolvedValue({
        success: true,
        data: {},
      } as any);
      vi.spyOn(postApi, "getPosts").mockResolvedValue({
        success: true,
        data: { posts: [dummyPost] },
      } as any);

      const dispatch = vi.fn().mockImplementation((action) => {
        if (typeof action === "function") return action(dispatch);
        return action;
      });

      const result = await actions.asyncCreatePost({ description: "Test" })(
        dispatch
      );

      expect(result).toBe(true);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(postApi, "createPost").mockResolvedValue({
        success: false,
        message: "Failed creation",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncCreatePost({ description: "Test" })(
        dispatch
      );

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Failed creation"
      );
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(postApi, "createPost").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncCreatePost({ description: "Test" })(
        dispatch
      );

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal membuat postingan."
      );
      expect(result).toBe(false);
    });
  });

  describe("asyncUpdatePost", () => {
    it("dispatches updatePostAction on success", async () => {
      vi.spyOn(postApi, "updatePost").mockResolvedValue({
        success: true,
        data: { post: dummyPost },
      } as any);

      const dispatch = vi.fn();
      const onSuccess = vi.fn();

      const result = await actions.asyncUpdatePost(
        "post-1",
        "New desc",
        onSuccess
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        actions.updatePostAction(dummyPost)
      );
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Postingan berhasil diperbarui!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(postApi, "updatePost").mockResolvedValue({
        success: false,
        message: "Update failed",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncUpdatePost("post-1", "New desc")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Update failed");
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(postApi, "updatePost").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncUpdatePost("post-1", "New desc")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal memperbarui postingan."
      );
    });
  });

  describe("asyncUploadPostCover", () => {
    it("dispatches asyncReceivePostDetail on success", async () => {
      vi.spyOn(postApi, "uploadPostCover").mockResolvedValue({
        success: true,
        data: { post: dummyPost },
      } as any);
      vi.spyOn(postApi, "getPostById").mockResolvedValue({
        success: true,
        data: { post: dummyPost },
      } as any);

      const dispatch = vi.fn().mockImplementation((action) => {
        if (typeof action === "function") return action(dispatch);
        return action;
      });
      const onSuccess = vi.fn();
      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });

      const result = await actions.asyncUploadPostCover(
        "post-1",
        file,
        onSuccess
      )(dispatch);

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Foto sampul berhasil diunggah!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(postApi, "uploadPostCover").mockResolvedValue({
        success: false,
        message: "Upload error",
      } as any);

      const dispatch = vi.fn();
      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const result = await actions.asyncUploadPostCover("post-1", file)(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Upload error");
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(postApi, "uploadPostCover").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      await actions.asyncUploadPostCover("post-1", file)(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal mengunggah cover postingan."
      );
    });
  });

  describe("asyncDeletePost", () => {
    it("deletes post when confirmed", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deletePost").mockResolvedValue({
        success: true,
      } as any);

      const dispatch = vi.fn();
      const onSuccess = vi.fn();

      const result = await actions.asyncDeletePost("post-1", onSuccess)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.deletePostAction("post-1"));
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Postingan berhasil dihapus!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("does nothing when confirmation is rejected", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);

      const dispatch = vi.fn();
      const result = await actions.asyncDeletePost("post-1")(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deletePost").mockResolvedValue({
        success: false,
        message: "Delete error",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncDeletePost("post-1")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Delete error");
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deletePost").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncDeletePost("post-1")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal menghapus postingan."
      );
    });
  });

  describe("asyncToggleLikePost", () => {
    it("toggles like optimistically and keeps server response when successful (matching detailPost)", async () => {
      vi.spyOn(postApi, "toggleLikePost").mockResolvedValue({
        success: true,
        data: { is_liked: true, total_likes: 1 },
      } as any);

      const dispatch = vi.fn();
      const getState = () => ({
        posts: {
          posts: [],
          detailPost: { ...dummyPost, is_liked: false, total_likes: 0 },
          loading: false,
        },
      });

      const result = await actions.asyncToggleLikePost("post-1")(
        dispatch,
        getState as any
      );

      expect(dispatch).toHaveBeenCalledWith(
        actions.toggleLikePostAction("post-1", true, 1)
      );
      expect(result).toBe(true);
    });

    it("toggles like optimistically and uses nextCount when total_likes is missing in server data", async () => {
      vi.spyOn(postApi, "toggleLikePost").mockResolvedValue({
        success: true,
        data: { is_liked: true },
      } as any);

      const dispatch = vi.fn();
      const getState = () => ({
        posts: {
          posts: [{ ...dummyPost, is_liked: false, total_likes: 0 }],
          detailPost: null,
          loading: false,
        },
      });

      const result = await actions.asyncToggleLikePost("post-1")(
        dispatch,
        getState as any
      );

      expect(dispatch).toHaveBeenCalledWith(
        actions.toggleLikePostAction("post-1", true, 1)
      );
      expect(result).toBe(true);
    });

    it("toggles like when unliking a post (count decreases)", async () => {
      vi.spyOn(postApi, "toggleLikePost").mockResolvedValue({
        success: true,
        data: undefined,
      } as any);

      const dispatch = vi.fn();
      const getState = () => ({
        posts: {
          posts: [{ ...dummyPost, is_liked: true, total_likes: 5 }],
          detailPost: null,
          loading: false,
        },
      });

      const result = await actions.asyncToggleLikePost("post-1")(
        dispatch,
        getState as any
      );

      expect(dispatch).toHaveBeenCalledWith(
        actions.toggleLikePostAction("post-1", false, 4)
      );
      expect(result).toBe(true);
    });

    it("toggles like for post not found in state (defaults to false/0)", async () => {
      vi.spyOn(postApi, "toggleLikePost").mockResolvedValue({
        success: true,
        data: undefined,
      } as any);

      const dispatch = vi.fn();
      const getState = () => ({
        posts: {
          posts: [],
          detailPost: null,
          loading: false,
        },
      });

      const result = await actions.asyncToggleLikePost("post-unknown")(
        dispatch,
        getState as any
      );

      expect(dispatch).toHaveBeenCalledWith(
        actions.toggleLikePostAction("post-unknown", true, 1)
      );
      expect(result).toBe(true);
    });

    it("rolls back optimistic like on API failure", async () => {
      vi.spyOn(postApi, "toggleLikePost").mockResolvedValue({
        success: false,
        message: "Like failed",
      } as any);

      const dispatch = vi.fn();
      const getState = () => ({
        posts: {
          posts: [{ ...dummyPost, is_liked: false, total_likes: 0 }],
          detailPost: null,
          loading: false,
        },
      });

      const result = await actions.asyncToggleLikePost("post-1")(
        dispatch,
        getState as any
      );

      expect(dispatch).toHaveBeenLastCalledWith(
        actions.toggleLikePostAction("post-1", false, 0)
      );
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Like failed");
      expect(result).toBe(false);
    });

    it("rolls back optimistic like on API failure with default message", async () => {
      vi.spyOn(postApi, "toggleLikePost").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      const getState = () => ({
        posts: {
          posts: [{ ...dummyPost, is_liked: false, total_likes: 0 }],
          detailPost: null,
          loading: false,
        },
      });

      await actions.asyncToggleLikePost("post-1")(
        dispatch,
        getState as any
      );

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal memperbarui suka."
      );
    });
  });

  describe("asyncAddComment", () => {
    const dummyComment = {
      id: "comm-1",
      comment: "Nice post",
      created_at: "2026-10-04T12:00:00.000Z",
    };

    it("dispatches addCommentAction on success", async () => {
      vi.spyOn(postApi, "addComment").mockResolvedValue({
        success: true,
        data: { comment: dummyComment },
      } as any);

      const dispatch = vi.fn();
      const onSuccess = vi.fn();

      const result = await actions.asyncAddComment(
        "post-1",
        "Nice post",
        onSuccess
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        actions.addCommentAction("post-1", dummyComment)
      );
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Komentar berhasil ditambahkan!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(postApi, "addComment").mockResolvedValue({
        success: false,
        message: "Failed comment",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncAddComment(
        "post-1",
        "Nice post"
      )(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Failed comment"
      );
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(postApi, "addComment").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncAddComment("post-1", "Nice post")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal menambahkan komentar."
      );
    });
  });

  describe("asyncDeleteComment", () => {
    it("deletes comment when confirmed", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deleteComment").mockResolvedValue({
        success: true,
      } as any);

      const dispatch = vi.fn();
      const onSuccess = vi.fn();

      const result = await actions.asyncDeleteComment(
        "post-1",
        "comm-1",
        onSuccess
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        actions.deleteCommentAction("post-1", "comm-1")
      );
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Komentar berhasil dihapus!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("does nothing when confirmation is rejected", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);

      const dispatch = vi.fn();
      const result = await actions.asyncDeleteComment(
        "post-1",
        "comm-1"
      )(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deleteComment").mockResolvedValue({
        success: false,
        message: "Delete comment error",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncDeleteComment(
        "post-1",
        "comm-1"
      )(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Delete comment error"
      );
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deleteComment").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncDeleteComment("post-1", "comm-1")(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal menghapus komentar."
      );
    });
  });

  describe("asyncDeleteAllMyPosts", () => {
    it("deletes all user posts when confirmed", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deleteAllMyPosts").mockResolvedValue({
        success: true,
      } as any);

      const dispatch = vi.fn();
      const onSuccess = vi.fn();

      const result = await actions.asyncDeleteAllMyPosts(onSuccess)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.deleteAllMyPostsAction());
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        "Semua postingan Anda telah berhasil dibersihkan!"
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("does nothing when confirmation is rejected", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);

      const dispatch = vi.fn();
      const result = await actions.asyncDeleteAllMyPosts()(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("handles failure and displays error dialog", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deleteAllMyPosts").mockResolvedValue({
        success: false,
        message: "Delete all error",
      } as any);

      const dispatch = vi.fn();
      const result = await actions.asyncDeleteAllMyPosts()(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Delete all error"
      );
      expect(result).toBe(false);
    });

    it("handles failure with default message", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
      vi.spyOn(postApi, "deleteAllMyPosts").mockResolvedValue({
        success: false,
      } as any);

      const dispatch = vi.fn();
      await actions.asyncDeleteAllMyPosts()(dispatch);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        "Gagal menghapus semua postingan."
      );
    });
  });
});

