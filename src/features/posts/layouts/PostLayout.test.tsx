import { renderWithProviders, screen, userEvent } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PostLayout from "./PostLayout";
import * as apiHelper from "@/helpers/apiHelper";
import * as userActions from "@/features/users/states/action";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("PostLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(userActions, "asyncReceiveProfile").mockReturnValue(
      () => Promise.resolve() as any
    );
  });

  it("shows loading/verifying state when no token is present", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(
      <PostLayout>
        <div>Content</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: {
            token: null,
            profile: null,
            isAuth: false,
            loading: false,
          },
        },
      }
    );

    expect(screen.getByText("Memverifikasi sesi...")).toBeInTheDocument();
  });

  it("renders children when token is in store and profile is loaded", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token-abc");

    renderWithProviders(
      <PostLayout>
        <div data-testid="child-content">Main Dashboard Body</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: {
            token: "token-abc",
            isAuth: true,
            loading: false,
            profile: {
              id: "user-1",
              name: "Risky Kevin",
              email: "risky@example.com",
            },
          },
        },
      }
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("calls asyncReceiveProfile when token exists but profile is null", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token-abc");

    renderWithProviders(
      <PostLayout>
        <div>Main Body</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: {
            token: "token-abc",
            profile: null,
            isAuth: true,
            loading: false,
          },
        },
      }
    );

    expect(userActions.asyncReceiveProfile).toHaveBeenCalled();
  });

  it("toggles sidebar on mobile menu click and closes sidebar when backdrop or close is clicked", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token-abc");

    renderWithProviders(
      <PostLayout>
        <div>Main Body</div>
      </PostLayout>,
      {
        preloadedState: {
          auth: {
            token: "token-abc",
            isAuth: true,
            loading: false,
            profile: {
              id: "user-1",
              name: "Risky",
              email: "risky@example.com",
            },
          },
        },
      }
    );

    const toggleBtn = screen.getByRole("button", {
      name: /Toggle navigation menu/i,
    });
    await user.click(toggleBtn);

    const backdrop = screen.getByTestId("sidebar-backdrop");
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop);
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});
