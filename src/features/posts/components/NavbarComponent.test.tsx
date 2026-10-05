import { renderWithProviders, screen, userEvent } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent";
import * as authActions from "@/features/auth/states/action";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with fallback info when no profile is present in state", () => {
    renderWithProviders(<NavbarComponent />);

    expect(screen.getByText("Delcom")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
    expect(screen.getByText("Risky Kevin Naibaho")).toBeInTheDocument();
    expect(screen.getByText("ifs24038@delcom.org")).toBeInTheDocument();
  });

  it("renders with user profile and photo from state", () => {
    renderWithProviders(<NavbarComponent />, {
      preloadedState: {
        auth: {
          token: "token-123",
          isAuth: true,
          loading: false,
          profile: {
            id: "u-1",
            name: "Risky Kevin",
            email: "risky@delcom.org",
            photo: "https://example.com/photo.png",
          },
        },
      },
    });

    expect(screen.getByText("Risky Kevin")).toBeInTheDocument();
    expect(screen.getByText("risky@delcom.org")).toBeInTheDocument();
    expect(screen.getByAltText("Risky Kevin")).toBeInTheDocument();
  });

  it("calls onToggleSidebar when mobile menu button is clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    renderWithProviders(<NavbarComponent onToggleSidebar={handleToggle} />);

    const toggleButton = screen.getByRole("button", {
      name: /Toggle navigation menu/i,
    });
    await user.click(toggleButton);

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("calls asyncLogout when logout button is clicked", async () => {
    const user = userEvent.setup();
    const logoutSpy = vi
      .spyOn(authActions, "asyncLogout")
      .mockImplementation((onSuccess) => {
        onSuccess?.();
        return (() => Promise.resolve()) as any;
      });

    renderWithProviders(<NavbarComponent />);

    const logoutBtn = screen.getByRole("button", {
      name: /Keluar dari akun/i,
    });
    await user.click(logoutBtn);

    expect(logoutSpy).toHaveBeenCalled();
  });
});
