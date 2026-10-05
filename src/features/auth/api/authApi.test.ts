import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi } from "./authApi";
import * as apiHelper from "@/helpers/apiHelper";

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call POST /auth/login with stringified payload", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "OK",
      data: {
        token: "tok-1",
        user: { id: "u1", name: "Risky", email: "risky@delcom.org" },
      },
    });

    const payload = { email: "risky@delcom.org", password: "secretPassword" };
    const result = await authApi.login(payload);

    expect(fetchSpy).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result.success).toBe(true);
    expect(result.data?.token).toBe("tok-1");
  });

  it("should call POST /auth/register with stringified payload", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "User registered",
      data: {
        user: { id: "u1", name: "Risky", email: "risky@delcom.org" },
      },
    });

    const payload = {
      name: "Risky",
      email: "risky@delcom.org",
      password: "secretPassword",
    };
    const result = await authApi.register(payload);

    expect(fetchSpy).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result.success).toBe(true);
    expect(result.data?.user.name).toBe("Risky");
  });
});

