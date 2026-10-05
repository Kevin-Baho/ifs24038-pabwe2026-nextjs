import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  receiveUsersAction,
  receiveUserProfileAction,
  asyncReceiveUsers,
  asyncReceiveProfile,
  asyncUpdateProfile,
  asyncUpdatePhoto,
  asyncUpdatePassword,
} from "./action";
import { userApi } from "../api/userApi";
import * as toolsHelper from "@/helpers/toolsHelper";
import { ActionType } from "@/types/action";
import { User } from "@/types";

describe("users actions", () => {
  const dummyUser: User = {
    id: "user-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create action creators correctly", () => {
    expect(receiveUsersAction([dummyUser])).toEqual({
      type: ActionType.USERS_RECEIVE,
      payload: { users: [dummyUser] },
    });

    expect(receiveUserProfileAction(dummyUser)).toEqual({
      type: ActionType.USER_PROFILE_RECEIVE,
      payload: { user: dummyUser },
    });
  });

  describe("asyncReceiveUsers", () => {
    it("should fetch users successfully and dispatch receiveUsersAction", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUsers").mockResolvedValueOnce({
        success: true,
        message: "OK",
        data: { users: [dummyUser] },
      });

      const thunk = asyncReceiveUsers();
      const result = await thunk(dispatch);

      expect(result).toEqual([dummyUser]);
      expect(dispatch).toHaveBeenCalledWith(receiveUsersAction([dummyUser]));
    });

    it("should handle error when fetching users", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "getUsers").mockResolvedValueOnce({
        success: false,
        message: "Failed to load users",
      });

      const thunk = asyncReceiveUsers();
      const result = await thunk(dispatch);

      expect(result).toEqual([]);
      expect(errorDialogSpy).toHaveBeenCalledWith("Failed to load users");
    });

    it("should fallback message when error message is empty on fetching users", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "getUsers").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncReceiveUsers();
      await thunk(dispatch);

      expect(errorDialogSpy).toHaveBeenCalledWith(
        "Gagal memuat daftar pengguna."
      );
    });
  });

  describe("asyncReceiveProfile", () => {
    it("should fetch profile and dispatch receiveUserProfileAction & setAuthProfileAction", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getMe").mockResolvedValueOnce({
        success: true,
        message: "OK",
        data: { user: dummyUser },
      });

      const thunk = asyncReceiveProfile();
      const result = await thunk(dispatch);

      expect(result).toEqual(dummyUser);
      expect(dispatch).toHaveBeenCalledWith(receiveUserProfileAction(dummyUser));
    });

    it("should handle error when fetching profile", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "getMe").mockResolvedValueOnce({
        success: false,
        message: "Unauthorized",
      });

      const thunk = asyncReceiveProfile();
      const result = await thunk(dispatch);

      expect(result).toBeNull();
      expect(errorDialogSpy).toHaveBeenCalledWith("Unauthorized");
    });

    it("should fallback message on fetching profile error when message is empty", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "getMe").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncReceiveProfile();
      await thunk(dispatch);

      expect(errorDialogSpy).toHaveBeenCalledWith("Gagal memuat data profil.");
    });
  });

  describe("asyncUpdateProfile", () => {
    it("should update profile successfully and call onSuccess", async () => {
      const dispatch = vi.fn();
      const successDialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
      const onSuccess = vi.fn();

      vi.spyOn(userApi, "updateMe").mockResolvedValueOnce({
        success: true,
        message: "Updated",
        data: { user: dummyUser },
      });

      const thunk = asyncUpdateProfile({ name: "Risky Updated" }, onSuccess);
      const result = await thunk(dispatch);

      expect(result).toBe(true);
      expect(successDialogSpy).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should update profile successfully without onSuccess callback", async () => {
      const dispatch = vi.fn();
      vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "updateMe").mockResolvedValueOnce({
        success: true,
        message: "Updated",
        data: { user: dummyUser },
      });

      const thunk = asyncUpdateProfile({ name: "Risky Updated" });
      const result = await thunk(dispatch);

      expect(result).toBe(true);
    });

    it("should handle update profile error", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "updateMe").mockResolvedValueOnce({
        success: false,
        message: "Validation error",
      });

      const thunk = asyncUpdateProfile({ name: "Risky" });
      const result = await thunk(dispatch);

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith("Validation error");
    });

    it("should fallback message when update profile error message is empty", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "updateMe").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncUpdateProfile({ name: "Risky" });
      await thunk(dispatch);

      expect(errorDialogSpy).toHaveBeenCalledWith("Gagal memperbarui profil.");
    });
  });

  describe("asyncUpdatePhoto", () => {
    it("should update photo successfully and trigger onSuccess", async () => {
      const dispatch = vi.fn();
      const successDialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
      const onSuccess = vi.fn();
      const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });

      vi.spyOn(userApi, "updatePhoto").mockResolvedValueOnce({
        success: true,
        message: "Photo updated",
        data: { user: dummyUser },
      });

      const thunk = asyncUpdatePhoto(fakeFile, onSuccess);
      const result = await thunk(dispatch);

      expect(result).toBe(true);
      expect(successDialogSpy).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should update photo successfully without callback", async () => {
      const dispatch = vi.fn();
      vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
      const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });

      vi.spyOn(userApi, "updatePhoto").mockResolvedValueOnce({
        success: true,
        message: "Photo updated",
        data: { user: dummyUser },
      });

      const thunk = asyncUpdatePhoto(fakeFile);
      const result = await thunk(dispatch);

      expect(result).toBe(true);
    });

    it("should handle error updating photo", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
      const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });

      vi.spyOn(userApi, "updatePhoto").mockResolvedValueOnce({
        success: false,
        message: "File too large",
      });

      const thunk = asyncUpdatePhoto(fakeFile);
      const result = await thunk(dispatch);

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith("File too large");
    });

    it("should fallback message when photo update error message is empty", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
      const fakeFile = new File(["dummy"], "photo.png", { type: "image/png" });

      vi.spyOn(userApi, "updatePhoto").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncUpdatePhoto(fakeFile);
      await thunk(dispatch);

      expect(errorDialogSpy).toHaveBeenCalledWith(
        "Gagal memperbarui foto profil."
      );
    });
  });

  describe("asyncUpdatePassword", () => {
    it("should update password successfully and trigger onSuccess", async () => {
      const successDialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
      const onSuccess = vi.fn();

      vi.spyOn(userApi, "updatePassword").mockResolvedValueOnce({
        success: true,
        message: "Password changed",
      });

      const thunk = asyncUpdatePassword(
        {
          old_password: "old",
          new_password: "new",
          confirm_password: "new",
        },
        onSuccess
      );
      const result = await thunk();

      expect(result).toBe(true);
      expect(successDialogSpy).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should update password successfully without callback", async () => {
      vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "updatePassword").mockResolvedValueOnce({
        success: true,
        message: "Password changed",
      });

      const thunk = asyncUpdatePassword({
        old_password: "old",
        new_password: "new",
        confirm_password: "new",
      });
      const result = await thunk();

      expect(result).toBe(true);
    });

    it("should handle error when updating password", async () => {
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "updatePassword").mockResolvedValueOnce({
        success: false,
        message: "Old password mismatch",
      });

      const thunk = asyncUpdatePassword({
        old_password: "old",
        new_password: "new",
        confirm_password: "new",
      });
      const result = await thunk();

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith("Old password mismatch");
    });

    it("should fallback message on password update error when message is empty", async () => {
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(userApi, "updatePassword").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncUpdatePassword({
        old_password: "old",
        new_password: "new",
        confirm_password: "new",
      });
      await thunk();

      expect(errorDialogSpy).toHaveBeenCalledWith(
        "Gagal memperbarui kata sandi."
      );
    });
  });
});

