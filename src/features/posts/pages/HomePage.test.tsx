import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import HomePage from "./HomePage";
import * as postActions from "../states/action";

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

describe("HomePage Component", () => {
  const dummyCurrentUser = {
    id: "user-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
  };

  const dummyPosts = [
    {
      id: "post-1",
      user_id: "user-1",
      author: {
        id: "user-1",
        name: "Risky Kevin Naibaho",
        photo: "https://open-api.delcom.org/avatars/risky.png",
      },
      description: "Postingan pertama saya di Delcom Post!",
      cover: "https://open-api.delcom.org/covers/post1.jpg",
      total_likes: 10,
      is_liked: true,
      total_comments: 2,
      created_at: "2026-10-04T10:00:00.000Z",
    },
    {
      id: "post-2",
      user_id: "user-2",
      author: {
        id: "user-2",
        name: "Budi Santoso",
        photo: null,
      },
      description: "Postingan dari user lain",
      cover: null,
      total_likes: 0,
      is_liked: false,
      total_comments: 0,
      created_at: "2026-10-04T11:00:00.000Z",
    },
    {
      id: "post-3",
      user_id: "user-3",
      author: null as any,
      description: "Postingan tanpa author",
      cover: null,
      total_likes: 0,
      is_liked: false,
      total_comments: 0,
      created_at: "2026-10-04T12:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.spyOn(postActions, "asyncReceivePosts").mockReturnValue((async () =>
      dummyPosts) as any);
  });

  it("should render empty state when no posts are available and handle create post button in empty state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, {
      preloadedState: {
        posts: { posts: [], detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(screen.getByText(/Belum ada postingan/i)).toBeInTheDocument();

    // Click "Buat Postingan Baru" in empty state
    const emptyStateCreateBtn = screen.getByRole("button", {
      name: /Buat Postingan Baru/i,
    });
    await user.click(emptyStateCreateBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close the modal
    const closeBtn = screen.getByLabelText(/Tutup modal/i);
    await user.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render empty state messages for search and isMe filters", async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams("is_me=1");

    renderWithProviders(<HomePage />, {
      preloadedState: {
        posts: { posts: [], detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(
      screen.getByText(/Anda belum membagikan postingan apa pun/i)
    ).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Cari postingan atau penulis/i);
    await user.type(searchInput, "query-pencarian");

    expect(
      screen.getByText(/Tidak ditemukan postingan yang sesuai dengan pencarian Anda/i)
    ).toBeInTheDocument();
  });

  it("should render posts list, author info, cover image, and description", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        posts: { posts: dummyPosts, detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(
      screen.getByText("Postingan pertama saya di Delcom Post!")
    ).toBeInTheDocument();
    expect(screen.getByText("Postingan dari user lain")).toBeInTheDocument();
    expect(screen.getByAltText("Risky Kevin Naibaho")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should trigger like toggle when like button is clicked", async () => {
    const user = userEvent.setup();
    const likeSpy = vi
      .spyOn(postActions, "asyncToggleLikePost")
      .mockReturnValue((async () => true) as any);

    renderWithProviders(<HomePage />, {
      preloadedState: {
        posts: { posts: dummyPosts, detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    const likeButtons = screen.getAllByRole("button", {
      name: /Suka postingan/i,
    });
    await user.click(likeButtons[0]);

    expect(likeSpy).toHaveBeenCalledWith("post-1");
  });

  it("should delete post when delete button on owned post is clicked", async () => {
    const user = userEvent.setup();
    const deleteSpy = vi
      .spyOn(postActions, "asyncDeletePost")
      .mockReturnValue((async () => true) as any);

    renderWithProviders(<HomePage />, {
      preloadedState: {
        posts: { posts: dummyPosts, detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    const deleteBtn = screen.getByLabelText(/Hapus postingan/i);
    await user.click(deleteBtn);

    expect(deleteSpy).toHaveBeenCalledWith("post-1");
  });

  it("should toggle between 'Semua Postingan' and 'Postingan Saya' and allow delete all", async () => {
    const user = userEvent.setup();
    const deleteAllSpy = vi
      .spyOn(postActions, "asyncDeleteAllMyPosts")
      .mockReturnValue((async () => true) as any);

    renderWithProviders(<HomePage />, {
      preloadedState: {
        posts: { posts: dummyPosts, detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    const toggleFilterBtn = screen.getByRole("button", {
      name: /Postingan Saya/i,
    });
    await user.click(toggleFilterBtn);

    const deleteAllBtn = screen.getByRole("button", {
      name: /Hapus Semua/i,
    });
    await user.click(deleteAllBtn);

    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should open AddModal when 'Buat Post' button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    const createPostBtn = screen.getByRole("button", {
      name: /^Buat Post$/i,
    });
    await user.click(createPostBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
