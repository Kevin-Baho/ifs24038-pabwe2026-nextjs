import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import AddModal from "./AddModal";
import * as postActions from "../states/action";

describe("AddModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/dummy-preview");
  });

  it("should not render when isOpen is false", () => {
    renderWithProviders(<AddModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Buat Postingan Baru/i)).not.toBeInTheDocument();
  });

  it("should render modal, handle close button click and Batal button click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/Buat Postingan Baru/i)).toBeInTheDocument();
    const closeBtn = screen.getByLabelText(/Tutup modal/i);
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<AddModal isOpen={true} onClose={onClose} />);
    const batalBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(batalBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should handle file selection, preview, removal and successful submit with cover", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const createPostSpy = vi
      .spyOn(postActions, "asyncCreatePost")
      .mockImplementation((payload, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/Apa yang ingin Anda bagikan/i);
    await user.type(textarea, "Halo ini postingan baru!");

    const fileInput = screen.getByTestId("cover-input") as HTMLInputElement;

    // Test file input with no files selected
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(screen.queryByAltText(/Preview Sampul/i)).not.toBeInTheDocument();

    const fakeFile = new File(["file-bytes"], "cover.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    expect(screen.getByAltText(/Preview Sampul/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Publikasikan/i });
    await user.click(submitBtn);

    expect(createPostSpy).toHaveBeenCalledWith(
      {
        description: "Halo ini postingan baru!",
        cover: fakeFile,
      },
      expect.any(Function)
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("should submit successfully without cover file", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const createPostSpy = vi
      .spyOn(postActions, "asyncCreatePost")
      .mockImplementation((payload, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(<AddModal isOpen={true} onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/Apa yang ingin Anda bagikan/i);
    await user.type(textarea, "Postingan tanpa gambar sampul");

    const submitBtn = screen.getByRole("button", { name: /Publikasikan/i });
    await user.click(submitBtn);

    expect(createPostSpy).toHaveBeenCalledWith(
      {
        description: "Postingan tanpa gambar sampul",
        cover: undefined,
      },
      expect.any(Function)
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("should not submit when description is empty or whitespace only", async () => {
    const createPostSpy = vi.spyOn(postActions, "asyncCreatePost");

    renderWithProviders(<AddModal isOpen={true} onClose={vi.fn()} />);

    const form = screen.getByRole("dialog").querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    expect(createPostSpy).not.toHaveBeenCalled();
  });

  it("should allow removing selected cover image before submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddModal isOpen={true} onClose={vi.fn()} />);

    const fileInput = screen.getByTestId("cover-input") as HTMLInputElement;
    const fakeFile = new File(["file-bytes"], "cover.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    const removeBtn = screen.getByLabelText(/Hapus cover/i);
    await user.click(removeBtn);

    expect(screen.queryByAltText(/Preview Sampul/i)).not.toBeInTheDocument();
  });
});

