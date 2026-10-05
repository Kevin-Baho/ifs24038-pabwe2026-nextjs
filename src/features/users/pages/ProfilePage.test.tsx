import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import ProfilePage from "./ProfilePage";
import * as userActions from "../states/action";

describe("ProfilePage Component", () => {
  const dummyProfile = {
    id: "u-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
    photo: "https://open-api.delcom.org/avatars/risky.png",
    created_at: "2026-10-04T08:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should dispatch asyncReceiveProfile when profile is null", () => {
    const receiveProfileSpy = vi
      .spyOn(userActions, "asyncReceiveProfile")
      .mockReturnValue((async () => dummyProfile) as any);

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: null, users: [], loading: false },
        auth: { profile: null, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(receiveProfileSpy).toHaveBeenCalled();
  });

  it("should render profile data when available", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: dummyProfile, users: [], loading: false },
        auth: { profile: dummyProfile, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(screen.getAllByText("Risky Kevin Naibaho")[0]).toBeInTheDocument();
    expect(screen.getAllByText("ifs24038@delcom.org")[0]).toBeInTheDocument();
  });

  it("should submit name change successfully", async () => {
    const user = userEvent.setup();
    const updateProfileSpy = vi
      .spyOn(userActions, "asyncUpdateProfile")
      .mockReturnValue((async () => true) as any);

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: dummyProfile, users: [], loading: false },
        auth: { profile: dummyProfile, token: "tok", isAuth: true, loading: false },
      },
    });

    const nameInput = screen.getByLabelText(/Nama Lengkap/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Risky Kevin Naibaho Updated");

    const submitBtn = screen.getByRole("button", {
      name: /Simpan Perubahan Nama/i,
    });
    await user.click(submitBtn);

    expect(updateProfileSpy).toHaveBeenCalledWith({
      name: "Risky Kevin Naibaho Updated",
    });
  });

  it("should not submit name change when name is empty", () => {
    const updateProfileSpy = vi
      .spyOn(userActions, "asyncUpdateProfile");

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: dummyProfile, users: [], loading: false },
        auth: { profile: dummyProfile, token: "tok", isAuth: true, loading: false },
      },
    });

    const nameInput = screen.getByLabelText(/Nama Lengkap/i);
    fireEvent.change(nameInput, { target: { value: "   " } });
    const form = nameInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }
    expect(updateProfileSpy).not.toHaveBeenCalled();
  });

  it("should handle photo file upload and empty file selection", async () => {
    const updatePhotoSpy = vi
      .spyOn(userActions, "asyncUpdatePhoto")
      .mockReturnValue((async () => true) as any);

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: dummyProfile, users: [], loading: false },
        auth: { profile: dummyProfile, token: "tok", isAuth: true, loading: false },
      },
    });

    const fileInput = screen.getByTestId("profile-photo-input") as HTMLInputElement;

    // Test with empty files
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [] } });
    });
    expect(updatePhotoSpy).not.toHaveBeenCalled();

    const file = new File(["avatar content"], "profile.png", {
      type: "image/png",
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(updatePhotoSpy).toHaveBeenCalledWith(file);
  });

  it("should submit password change successfully and handle empty password fields", async () => {
    const user = userEvent.setup();
    const updatePasswordSpy = vi
      .spyOn(userActions, "asyncUpdatePassword")
      .mockImplementation((payload, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: dummyProfile, users: [], loading: false },
        auth: { profile: dummyProfile, token: "tok", isAuth: true, loading: false },
      },
    });

    const oldPwd = screen.getByLabelText(/Kata Sandi Saat Ini/i);
    const newPwd = screen.getByLabelText(/^Kata Sandi Baru$/i);
    const confirmPwd = screen.getByLabelText(/Konfirmasi Kata Sandi Baru/i);

    // Test submitting when empty
    const passwordForm = oldPwd.closest("form");
    if (passwordForm) {
      fireEvent.submit(passwordForm);
    }
    expect(updatePasswordSpy).not.toHaveBeenCalled();

    await user.type(oldPwd, "oldSecret123");
    await user.type(newPwd, "newSecret456");
    await user.type(confirmPwd, "newSecret456");

    const submitBtn = screen.getByRole("button", {
      name: /Perbarui Kata Sandi/i,
    });
    await user.click(submitBtn);

    expect(updatePasswordSpy).toHaveBeenCalledWith(
      {
        old_password: "oldSecret123",
        new_password: "newSecret456",
        confirm_password: "newSecret456",
      },
      expect.any(Function)
    );
  });

  it("should render profile without photo and without name", () => {
    const emptyProfile = {
      id: "u-2",
      name: "",
      email: "empty@delcom.org",
      photo: null,
      created_at: "",
    };

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        users: { profile: emptyProfile as any, users: [], loading: false },
        auth: { profile: emptyProfile as any, token: "tok", isAuth: true, loading: false },
      },
    });

    expect(screen.getAllByText("Risky Kevin Naibaho")[0]).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
  });
});
