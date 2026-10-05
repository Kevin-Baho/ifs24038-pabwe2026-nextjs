import { _fetchWithAuth } from "@/helpers/apiHelper";
import {
  ApiResult,
  CreatePostPayload,
  Post,
  PostComment,
} from "@/types";

export const postApi = {
  async getPosts(
    search?: string,
    isMe?: boolean
  ): Promise<ApiResult<{ posts: Post[] }>> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (isMe) params.append("is_me", "1");

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return _fetchWithAuth<{ posts: Post[] }>(`/posts${queryString}`, {
      method: "GET",
    });
  },

  async getPostById(id: string): Promise<ApiResult<{ post: Post }>> {
    return _fetchWithAuth<{ post: Post }>(`/posts/${id}`, {
      method: "GET",
    });
  },

  async createPost(
    payload: CreatePostPayload
  ): Promise<ApiResult<{ post: Post }>> {
    const formData = new FormData();
    formData.append("description", payload.description);
    if (payload.cover) {
      formData.append("cover", payload.cover);
    }

    return _fetchWithAuth<{ post: Post }>("/posts", {
      method: "POST",
      body: formData,
    });
  },

  async updatePost(
    id: string,
    description: string
  ): Promise<ApiResult<{ post: Post }>> {
    return _fetchWithAuth<{ post: Post }>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ description }),
    });
  },

  async uploadPostCover(
    id: string,
    cover: File
  ): Promise<ApiResult<{ post: Post }>> {
    const formData = new FormData();
    formData.append("cover", cover);

    return _fetchWithAuth<{ post: Post }>(`/posts/${id}/cover`, {
      method: "POST",
      body: formData,
    });
  },

  async deletePost(id: string): Promise<ApiResult<unknown>> {
    return _fetchWithAuth(`/posts/${id}`, {
      method: "DELETE",
    });
  },

  async toggleLikePost(
    id: string
  ): Promise<ApiResult<{ is_liked: boolean; total_likes: number }>> {
    return _fetchWithAuth<{ is_liked: boolean; total_likes: number }>(
      `/posts/${id}/likes`,
      {
        method: "POST",
      }
    );
  },

  async addComment(
    postId: string,
    comment: string
  ): Promise<ApiResult<{ comment: PostComment }>> {
    return _fetchWithAuth<{ comment: PostComment }>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  },

  async deleteComment(
    postId: string,
    commentId: string
  ): Promise<ApiResult<unknown>> {
    return _fetchWithAuth(`/posts/${postId}/comments`, {
      method: "DELETE",
      body: JSON.stringify({ comment_id: commentId }),
    });
  },

  async deleteAllMyPosts(): Promise<ApiResult<unknown>> {
    return _fetchWithAuth("/posts", {
      method: "DELETE",
    });
  },
};

