import { renderWithProviders, screen, userEvent } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarComponent from "./SidebarComponent";
import * as postActions from "../states/action";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all navigation items and handles close handlers", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    renderWithProviders(<SidebarComponent isOpen={true} onClose={handleClose} />);

    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.getByText("Postingan Saya")).toBeInTheDocument();
    expect(screen.getByText("Daftar Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.getByText("Hapus Semua Post")).toBeInTheDocument();

    const backdrop = screen.getByTestId("sidebar-backdrop");
    await user.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole("button", { name: /Tutup sidebar/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);

    const link = screen.getByText("Beranda");
    await user.click(link);
    expect(handleClose).toHaveBeenCalledTimes(3);
  });

  it("dispatches asyncDeleteAllMyPosts when 'Hapus Semua Post' is clicked", async () => {
    const user = userEvent.setup();
    const deleteAllSpy = vi
      .spyOn(postActions, "asyncDeleteAllMyPosts")
      .mockReturnValue((() => Promise.resolve(true)) as any);

    renderWithProviders(<SidebarComponent isOpen={false} />);

    const deleteBtn = screen.getByRole("button", {
      name: /Hapus Semua Post/i,
    });
    await user.click(deleteBtn);

    expect(deleteAllSpy).toHaveBeenCalled();
  });
});
