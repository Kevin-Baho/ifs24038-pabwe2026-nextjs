import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import ChangeCoverModal from "./ChangeCoverModal";
import * as postActions from "../states/action";

describe("ChangeCoverModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/new-cover");
  });

  it("should not render when isOpen is false", () => {
    renderWithProviders(
      <ChangeCoverModal isOpen={false} onClose={vi.fn()} postId="p-1" />
    );
    expect(
      screen.queryByText(/Ganti Foto Sampul Postingan/i)
    ).not.toBeInTheDocument();
  });

  it("should select file, render preview, submit cover change", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const uploadSpy = vi
      .spyOn(postActions, "asyncUploadPostCover")
      .mockImplementation((id, file, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} postId="p-1" />
    );

    const fileInput = screen.getByTestId("change-cover-input") as HTMLInputElement;

    // Test file input with empty files
    fireEvent.change(fileInput, { target: { files: [] } });
    expect(screen.queryByAltText(/Preview Cover Baru/i)).not.toBeInTheDocument();

    const fakeFile = new File(["bytes"], "new-cover.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    expect(screen.getByAltText(/Preview Cover Baru/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Unggah Sampul/i });
    await user.click(submitBtn);

    expect(uploadSpy).toHaveBeenCalledWith("p-1", fakeFile, expect.any(Function));
    expect(onClose).toHaveBeenCalled();
  });

  it("should not submit when coverFile is null", async () => {
    const uploadSpy = vi.spyOn(postActions, "asyncUploadPostCover");

    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={vi.fn()} postId="p-1" />
    );

    const form = screen.getByRole("dialog").querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  it("should allow removing selected preview before submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={vi.fn()} postId="p-1" />
    );

    const fileInput = screen.getByTestId("change-cover-input") as HTMLInputElement;

    const fakeFile = new File(["bytes"], "new-cover.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    const removeBtn = screen.getByLabelText(/Hapus preview cover/i);
    await user.click(removeBtn);

    expect(screen.queryByAltText(/Preview Cover Baru/i)).not.toBeInTheDocument();
  });

  it("should close modal when close icon is clicked and when Batal is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { rerender } = renderWithProviders(
      <ChangeCoverModal isOpen={true} onClose={onClose} postId="p-1" />
    );

    const closeBtn = screen.getByLabelText(/Tutup modal/i);
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <ChangeCoverModal isOpen={true} onClose={onClose} postId="p-1" />
    );
    const batalBtn = screen.getByRole("button", { name: /Batal/i });
    await user.click(batalBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

