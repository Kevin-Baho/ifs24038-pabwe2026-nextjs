import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import AuthLayout from "./AuthLayout";
import * as apiHelper from "@/helpers/apiHelper";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe("AuthLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is not authenticated", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(
      <AuthLayout>
        <div data-testid="auth-child">Child Content</div>
      </AuthLayout>,
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

    expect(screen.getByTestId("auth-child")).toBeInTheDocument();
    expect(screen.getByText(/Delcom Post App/i)).toBeInTheDocument();
    expect(screen.getByText(/Risky Kevin Naibaho/i)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should redirect to / when isAuth is true or token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("active-token");

    renderWithProviders(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>,
      {
        preloadedState: {
          auth: {
            token: "active-token",
            profile: null,
            isAuth: true,
            loading: false,
          },
        },
      }
    );

    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});

