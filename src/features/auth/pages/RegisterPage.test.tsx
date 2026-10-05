import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import RegisterPage from "./RegisterPage";
import * as authActions from "../states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RegisterPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render registration fields and disabled button initially", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /Daftar Akun/i });
    expect(submitBtn).toBeDisabled();
  });

  it("should submit registration successfully and navigate to login", async () => {
    const user = userEvent.setup();
    const registerThunkSpy = vi
      .spyOn(authActions, "asyncRegister")
      .mockImplementation((payload, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Nama Lengkap/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Kata Sandi/i);
    const submitBtn = screen.getByRole("button", { name: /Daftar Akun/i });

    await user.type(nameInput, "Risky Kevin Naibaho");
    await user.type(emailInput, "ifs24038@delcom.org");
    await user.type(passwordInput, "secret123");

    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    expect(registerThunkSpy).toHaveBeenCalledWith(
      {
        name: "Risky Kevin Naibaho",
        email: "ifs24038@delcom.org",
        password: "secret123",
      },
      expect.any(Function)
    );
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should prevent submission if any field is missing", () => {
    const registerThunkSpy = vi.spyOn(authActions, "asyncRegister");
    const { container } = renderWithProviders(<RegisterPage />);

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    expect(registerThunkSpy).not.toHaveBeenCalled();
  });
});

