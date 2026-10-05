import { renderWithProviders, screen, userEvent } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UsersPage from "./UsersPage";
import * as userActions from "../states/action";

describe("UsersPage Component", () => {
  const dummyUsers = [
    {
      id: "u-1",
      name: "Risky Kevin Naibaho",
      email: "risky@example.com",
      photo: "https://example.com/risky.jpg",
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "u-2",
      name: "Budi Santoso",
      email: "budi@example.com",
      photo: "",
      created_at: "",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(userActions, "asyncReceiveUsers").mockReturnValue(
      () => Promise.resolve() as any
    );
  });

  it("renders users list correctly and dispatches asyncReceiveUsers", async () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: {
          users: dummyUsers,
          profile: null,
          loading: false,
        },
      },
    });

    expect(userActions.asyncReceiveUsers).toHaveBeenCalled();
    expect(screen.getByText("Risky Kevin Naibaho")).toBeInTheDocument();
    expect(screen.getByText("risky@example.com")).toBeInTheDocument();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("budi@example.com")).toBeInTheDocument();
    expect(screen.getByAltText("Risky Kevin Naibaho")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("filters users based on search input for name or email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: {
          users: dummyUsers,
          profile: null,
          loading: false,
        },
      },
    });

    const searchInput = screen.getByPlaceholderText(/Cari nama atau email/i);
    await user.type(searchInput, "risky");

    expect(screen.getByText("Risky Kevin Naibaho")).toBeInTheDocument();
    expect(screen.queryByText("Budi Santoso")).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, "budi@example.com");

    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.queryByText("Risky Kevin Naibaho")).not.toBeInTheDocument();
  });

  it("shows empty state when search finds no matching users", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: {
          users: dummyUsers,
          profile: null,
          loading: false,
        },
      },
    });

    const searchInput = screen.getByPlaceholderText(/Cari nama atau email/i);
    await user.type(searchInput, "nonexistent");

    expect(screen.getByText("Pengguna tidak ditemukan")).toBeInTheDocument();
  });
});
