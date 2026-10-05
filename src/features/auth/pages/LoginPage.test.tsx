import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils";
import LoginPage from "./LoginPage";
import * as authActions from "../states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render form inputs and disabled submit button initially", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /Masuk/i });
    expect(submitBtn).toBeDisabled();
  });

  it("should enable submit button when inputs are filled and dispatch asyncLogin", async () => {
    const user = userEvent.setup();
    const loginThunkSpy = vi
      .spyOn(authActions, "asyncLogin")
      .mockImplementation((payload, onSuccess) => {
        onSuccess?.();
        return (async () => true) as any;
      });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Kata Sandi/i);
    const submitBtn = screen.getByRole("button", { name: /Masuk/i });

    await user.type(emailInput, "ifs24038@delcom.org");
    await user.type(passwordInput, "secret123");

    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    expect(loginThunkSpy).toHaveBeenCalledWith(
      {
        email: "ifs24038@delcom.org",
        password: "secret123",
      },
      expect.any(Function)
    );
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should not submit if email or password is empty on direct form submit", () => {
    const loginThunkSpy = vi.spyOn(authActions, "asyncLogin");
    const { container } = renderWithProviders(<LoginPage />);

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    expect(loginThunkSpy).not.toHaveBeenCalled();
  });
});

