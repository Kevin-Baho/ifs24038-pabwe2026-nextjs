import { renderWithProviders, screen, userEvent, fireEvent } from "@/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal";
import * as postActions from "../states/action";

describe("ChangeModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    renderWithProviders(
      <ChangeModal
        isOpen={false}
        onClose={vi.fn()}
        postId="post-1"
        initialDescription="Initial"
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders correctly when isOpen is true and updates description via useEffect when re-opened", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = renderWithProviders(
      <ChangeModal
        isOpen={true}
        onClose={handleClose}
        postId="post-1"
        initialDescription="Initial description"
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Initial description")).toBeInTheDocument();

    // Click cancel button
    await user.click(screen.getByRole("button", { name: /Batal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click close icon button
    await user.click(screen.getByRole("button", { name: /Tutup modal/i }));
    expect(handleClose).toHaveBeenCalledTimes(2);

    // Re-open with new initial description
    rerender(
      <ChangeModal
        isOpen={true}
        onClose={handleClose}
        postId="post-1"
        initialDescription="Updated initial"
      />
    );
    expect(screen.getByDisplayValue("Updated initial")).toBeInTheDocument();
  });

  it("submits the form and calls asyncUpdatePost", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const updateSpy = vi
      .spyOn(postActions, "asyncUpdatePost")
      .mockImplementation((id, desc, onSuccess) => {
        onSuccess?.();
        return (() => Promise.resolve(true)) as any;
      });

    renderWithProviders(
      <ChangeModal
        isOpen={true}
        onClose={handleClose}
        postId="post-1"
        initialDescription="Initial"
      />
    );

    const textarea = screen.getByPlaceholderText(/Perbarui isi postingan/i);
    await user.clear(textarea);
    await user.type(textarea, "Updated post text");

    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
    await user.click(submitBtn);

    expect(updateSpy).toHaveBeenCalledWith(
      "post-1",
      "Updated post text",
      expect.any(Function)
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it("does not submit when description is empty or whitespace", async () => {
    const updateSpy = vi.spyOn(postActions, "asyncUpdatePost");

    renderWithProviders(
      <ChangeModal
        isOpen={true}
        onClose={vi.fn()}
        postId="post-1"
        initialDescription=""
      />
    );

    const form = screen.getByRole("dialog").querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    expect(updateSpy).not.toHaveBeenCalled();
  });
});

