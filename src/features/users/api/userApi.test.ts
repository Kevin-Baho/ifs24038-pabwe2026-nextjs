import { describe, it, expect, vi, beforeEach } from "vitest";
import { userApi } from "./userApi";
import * as apiHelper from "@/helpers/apiHelper";

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call GET /users", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "OK",
      data: { users: [] },
    });

    const result = await userApi.getUsers();
    expect(fetchSpy).toHaveBeenCalledWith("/users", { method: "GET" });
    expect(result.success).toBe(true);
  });

  it("should call GET /users/me", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "OK",
      data: {
        user: { id: "u1", name: "Risky", email: "ifs24038@delcom.org" },
      },
    });

    const result = await userApi.getMe();
    expect(fetchSpy).toHaveBeenCalledWith("/users/me", { method: "GET" });
    expect(result.success).toBe(true);
  });

  it("should call PUT /users/me with update name payload", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "Profile updated",
      data: {
        user: { id: "u1", name: "Risky Updated", email: "ifs24038@delcom.org" },
      },
    });

    const result = await userApi.updateMe({ name: "Risky Updated" });
    expect(fetchSpy).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: JSON.stringify({ name: "Risky Updated" }),
    });
    expect(result.success).toBe(true);
  });

  it("should call POST /users/me/photo with FormData", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "Photo updated",
      data: {
        user: { id: "u1", name: "Risky", email: "ifs24038@delcom.org" },
      },
    });

    const fakeFile = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    });
    const result = await userApi.updatePhoto(fakeFile);

    expect(fetchSpy).toHaveBeenCalledWith("/users/me/photo", {
      method: "POST",
      body: expect.any(FormData),
    });
    expect(result.success).toBe(true);
  });

  it("should call PUT /users/me/password with payload", async () => {
    const fetchSpy = vi.spyOn(apiHelper, "_fetchWithAuth").mockResolvedValueOnce({
      success: true,
      message: "Password updated",
    });

    const payload = {
      old_password: "old",
      new_password: "new",
      confirm_password: "new",
    };
    const result = await userApi.updatePassword(payload);

    expect(fetchSpy).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(result.success).toBe(true);
  });
});

