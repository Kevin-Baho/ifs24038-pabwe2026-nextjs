import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import DetailPage from "./DetailPage";
import * as postActions from "../states/action";

const mockPush = vi.fn();
let mockParams: Record<string, string> = { postId: "post-1" };

vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
}));

describe("DetailPage Component", () => {
  const dummyCurrentUser = {
    id: "user-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
    photo: "https://open-api.delcom.org/avatars/me.png",
  };

  const dummyDetailPost = {
    id: "post-1",
    user_id: "user-1",
    author: {
      id: "user-1",
      name: "Risky Kevin Naibaho",
      photo: "https://open-api.delcom.org/avatars/risky.png",
    },
    description: "Detail postingan utama",
    cover: "https://open-api.delcom.org/covers/post1.jpg",
    total_likes: 5,
    is_liked: false,
    total_comments: 2,
    comments: [
      {
        id: "comm-1",
        user_id: "user-1",
        author: {
          id: "user-1",
          name: "Risky Kevin Naibaho",
          photo: null,
        },
        comment: "Komentar pertama saya",
        created_at: "2026-10-04T12:00:00.000Z",
      },
      {
        id: "comm-2",
        user_id: "user-2",
        author: {
          id: "user-2",
          name: "Budi Santoso",
          photo: "https://open-api.delcom.org/avatars/budi.png",
        },
        comment: "Komentar kedua dengan foto",
        created_at: "2026-10-04T13:00:00.000Z",
      },
    ],
    created_at: "2026-10-04T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { postId: "post-1" };
  });

  it("should show loading state when detailPost is not yet loaded", () => {
    vi.spyOn(postActions, "asyncReceivePostDetail").mockReturnValue((async () =>
      null) as any);

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(screen.getByText(/Memuat detail postingan.../i)).toBeInTheDocument();
  });

  it("does not fetch detail when postId is empty", () => {
    mockParams = {};
    const detailSpy = vi.spyOn(postActions, "asyncReceivePostDetail");

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: null, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(detailSpy).not.toHaveBeenCalled();
  });

  it("should render post details, handle likes and author delete", async () => {
    const user = userEvent.setup();
    const likeSpy = vi
      .spyOn(postActions, "asyncToggleLikePost")
      .mockReturnValue((async () => true) as any);
    const deletePostSpy = vi
      .spyOn(postActions, "asyncDeletePost")
      .mockImplementation((id, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: dummyDetailPost, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(screen.getByText("Detail postingan utama")).toBeInTheDocument();
    expect(screen.getByText("Komentar pertama saya")).toBeInTheDocument();
    expect(screen.getByText("Komentar kedua dengan foto")).toBeInTheDocument();
    expect(screen.getByAltText("Budi Santoso")).toBeInTheDocument();

    const likeBtn = screen.getByLabelText(/Suka postingan/i);
    await user.click(likeBtn);
    expect(likeSpy).toHaveBeenCalledWith("post-1");

    // Delete post
    const deleteBtn = screen.getByLabelText(/Hapus postingan/i);
    await user.click(deleteBtn);
    expect(deletePostSpy).toHaveBeenCalledWith("post-1", expect.any(Function));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should open and close edit and cover modals", async () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: dummyDetailPost, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    // Open & close edit modal
    const editBtn = screen.getByLabelText(/Edit deskripsi/i);
    fireEvent.click(editBtn);
    const editDialog = screen.getByRole("dialog");
    expect(
      within(editDialog).getByRole("heading", { name: /Ubah Deskripsi/i })
    ).toBeInTheDocument();

    const cancelEditBtn = within(editDialog).getByRole("button", {
      name: /Batal/i,
    });
    fireEvent.click(cancelEditBtn);

    // Open & close cover modal
    const coverBtn = screen.getByLabelText(/Ganti cover/i);
    fireEvent.click(coverBtn);
    const coverDialog = screen.getByRole("dialog");
    expect(
      within(coverDialog).getByRole("heading", {
        name: /Ganti Foto Sampul Postingan/i,
      })
    ).toBeInTheDocument();

    const cancelCoverBtn = within(coverDialog).getByRole("button", {
      name: /Batal/i,
    });
    fireEvent.click(cancelCoverBtn);
  });

  it("should submit new comment and delete comment", async () => {
    const user = userEvent.setup();
    const addCommentSpy = vi
      .spyOn(postActions, "asyncAddComment")
      .mockImplementation((postId, comment, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    const deleteCommentSpy = vi
      .spyOn(postActions, "asyncDeleteComment")
      .mockReturnValue((async () => true) as any);

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: dummyDetailPost, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    const commentInput = screen.getByPlaceholderText(/Tuliskan komentar Anda.../i);

    // Test submitting empty comment does not dispatch
    fireEvent.submit(commentInput.closest("form")!);
    expect(addCommentSpy).not.toHaveBeenCalled();

    await user.type(commentInput, "Komentar baru ditambahkan!");

    const sendCommentBtn = screen.getByRole("button", { name: /Kirim/i });
    await user.click(sendCommentBtn);

    expect(addCommentSpy).toHaveBeenCalledWith(
      "post-1",
      "Komentar baru ditambahkan!",
      expect.any(Function)
    );

    const deleteCommentBtns = screen.getAllByLabelText(/Hapus komentar/i);
    await user.click(deleteCommentBtns[0]);

    expect(deleteCommentSpy).toHaveBeenCalledWith("post-1", "comm-1");
  });

  it("should render post without cover, author fallback, and viewer perspective", () => {
    const postFallback = {
      id: "post-2",
      user_id: "user-2",
      description: "Deskripsi post fallback",
      cover: null,
      total_likes: 0,
      is_liked: true,
      total_comments: 1,
      author: null as any,
      comments: [
        {
          id: "comm-3",
          user_id: "user-99",
          comment: "Komentar tanpa author",
          created_at: "2026-10-04T12:00:00.000Z",
          author: null,
        },
      ],
      created_at: "2026-10-04T10:00:00.000Z",
    };

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: postFallback as any, loading: false },
        auth: {
          profile: { id: "user-viewer", name: "Viewer", email: "viewer@delcom.org", photo: null },
          token: "tok",
          isAuth: true,
          loading: false,
        },
      },
    });

    expect(screen.queryByAltText("Sampul postingan")).not.toBeInTheDocument();
    expect(screen.getAllByText("Pengguna Delcom")[0]).toBeInTheDocument();
    expect(screen.queryByLabelText(/Edit deskripsi/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Hapus komentar/i)).not.toBeInTheDocument();
  });

  it("should recognize author when currentUser matches author.id even if user_id differs", () => {
    const postWithAuthorId = {
      ...dummyDetailPost,
      id: "post-3",
      user_id: "different-user-id",
      author: {
        id: "user-1",
        name: "Risky",
        photo: null,
      },
    };

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: postWithAuthorId, loading: false },
        auth: { profile: dummyCurrentUser, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(screen.getByLabelText(/Edit deskripsi/i)).toBeInTheDocument();
  });

  it("should render avatar fallback 'U' when currentUser has no name and photo, and handle null comments", () => {
    const postWithNullComments = {
      ...dummyDetailPost,
      id: "post-4",
      comments: null as any,
    };

    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: postWithNullComments, loading: false },
        auth: { profile: null, token: "tok", isAuth: true, loading: false },
        users: {
          profile: { id: "user-empty", name: "", photo: null } as any,
          users: [],
          loading: false,
        },
      },
    });

    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.getByText(/Belum ada komentar/i)).toBeInTheDocument();
  });

  it("renders photo alt fallback when currentUser has photo but no name", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        posts: { posts: [], detailPost: dummyDetailPost, loading: false },
        auth: {
          profile: { id: "user-1", name: "", photo: "https://example.com/avatar.jpg" } as any,
          token: "tok",
          isAuth: true,
          loading: false,
        },
      },
    });

    expect(screen.getByAltText("Pengguna")).toBeInTheDocument();
  });
});

