import { describe, it, expect, vi, beforeEach } from "vitest";
import { postApi } from "./postApi";
import * as apiHelper from "@/helpers/apiHelper";

describe("postApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls getPosts with and without query parameters", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { posts: [] } } as any);

    await postApi.getPosts();
    expect(fetchSpy).toHaveBeenCalledWith("/posts", { method: "GET" });

    await postApi.getPosts("test", true);
    expect(fetchSpy).toHaveBeenCalledWith("/posts?search=test&is_me=1", {
      method: "GET",
    });
  });

  it("calls getPostById with post id", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { post: {} } } as any);

    await postApi.getPostById("p-123");
    expect(fetchSpy).toHaveBeenCalledWith("/posts/p-123", { method: "GET" });
  });

  it("calls createPost with and without cover file", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { post: {} } } as any);

    await postApi.createPost({ description: "Hello world" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/posts",
      expect.objectContaining({ method: "POST" })
    );

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    await postApi.createPost({ description: "Hello world", cover: file });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/posts",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("calls updatePost with id and description", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { post: {} } } as any);

    await postApi.updatePost("p-123", "Updated desc");
    expect(fetchSpy).toHaveBeenCalledWith("/posts/p-123", {
      method: "PUT",
      body: JSON.stringify({ description: "Updated desc" }),
    });
  });

  it("calls uploadPostCover with id and cover file", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { post: {} } } as any);

    const file = new File(["dummy"], "cover.png", { type: "image/png" });
    await postApi.uploadPostCover("p-123", file);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/posts/p-123/cover",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("calls deletePost with id", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true } as any);

    await postApi.deletePost("p-123");
    expect(fetchSpy).toHaveBeenCalledWith("/posts/p-123", {
      method: "DELETE",
    });
  });

  it("calls toggleLikePost with id", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { is_liked: true, total_likes: 1 } } as any);

    await postApi.toggleLikePost("p-123");
    expect(fetchSpy).toHaveBeenCalledWith("/posts/p-123/likes", {
      method: "POST",
    });
  });

  it("calls addComment with postId and comment text", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true, data: { comment: {} } } as any);

    await postApi.addComment("p-123", "Great post!");
    expect(fetchSpy).toHaveBeenCalledWith("/posts/p-123/comments", {
      method: "POST",
      body: JSON.stringify({ comment: "Great post!" }),
    });
  });

  it("calls deleteComment with postId and commentId", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true } as any);

    await postApi.deleteComment("p-123", "c-456");
    expect(fetchSpy).toHaveBeenCalledWith("/posts/p-123/comments", {
      method: "DELETE",
      body: JSON.stringify({ comment_id: "c-456" }),
    });
  });

  it("calls deleteAllMyPosts", async () => {
    const fetchSpy = vi
      .spyOn(apiHelper, "_fetchWithAuth")
      .mockResolvedValue({ success: true } as any);

    await postApi.deleteAllMyPosts();
    expect(fetchSpy).toHaveBeenCalledWith("/posts", {
      method: "DELETE",
    });
  });
});

