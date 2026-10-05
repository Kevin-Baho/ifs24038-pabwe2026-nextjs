import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  authLoginSuccessAction,
  authLogoutAction,
  setAuthProfileAction,
  asyncLogin,
  asyncRegister,
  asyncLogout,
} from "./action";
import { authApi } from "../api/authApi";
import * as apiHelper from "@/helpers/apiHelper";
import * as toolsHelper from "@/helpers/toolsHelper";
import { ActionType } from "@/types/action";
import { User } from "@/types";

describe("auth actions", () => {
  const dummyUser: User = {
    id: "user-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create auth action creators correctly", () => {
    expect(authLoginSuccessAction("tok", dummyUser)).toEqual({
      type: ActionType.AUTH_LOGIN_SUCCESS,
      payload: { token: "tok", user: dummyUser },
    });

    expect(authLogoutAction()).toEqual({
      type: ActionType.AUTH_LOGOUT,
    });

    expect(setAuthProfileAction(dummyUser)).toEqual({
      type: ActionType.AUTH_SET_PROFILE,
      payload: { user: dummyUser },
    });
  });

  describe("asyncLogin", () => {
    it("should handle login success with token and call onSuccess callback", async () => {
      const dispatch = vi.fn();
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken");
      const successDialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
      const onSuccess = vi.fn();

      vi.spyOn(authApi, "login").mockResolvedValueOnce({
        success: true,
        message: "Login OK",
        data: { token: "jwt-tok", user: dummyUser },
      });

      const thunk = asyncLogin(
        { email: "ifs24038@delcom.org", password: "password" },
        onSuccess
      );
      const result = await thunk(dispatch);

      expect(result).toBe(true);
      expect(putTokenSpy).toHaveBeenCalledWith("jwt-tok");
      expect(dispatch).toHaveBeenCalledWith(
        authLoginSuccessAction("jwt-tok", dummyUser)
      );
      expect(successDialogSpy).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should handle login success without optional callback", async () => {
      const dispatch = vi.fn();
      vi.spyOn(apiHelper, "putAccessToken");
      vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      vi.spyOn(authApi, "login").mockResolvedValueOnce({
        success: true,
        message: "Login OK",
        data: { token: "jwt-tok", user: dummyUser },
      });

      const thunk = asyncLogin({
        email: "ifs24038@delcom.org",
        password: "password",
      });
      const result = await thunk(dispatch);

      expect(result).toBe(true);
    });

    it("should handle login failure and show error dialog", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(authApi, "login").mockResolvedValueOnce({
        success: false,
        message: "Invalid credentials",
      });

      const thunk = asyncLogin({
        email: "wrong@email.com",
        password: "wrong",
      });
      const result = await thunk(dispatch);

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith("Invalid credentials");
      expect(dispatch).not.toHaveBeenCalled();
    });

    it("should fallback message on login failure when message is empty", async () => {
      const dispatch = vi.fn();
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(authApi, "login").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncLogin({
        email: "wrong@email.com",
        password: "wrong",
      });
      const result = await thunk(dispatch);

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith(
        "Gagal masuk. Silakan periksa kredensial Anda."
      );
    });
  });

  describe("asyncRegister", () => {
    it("should handle register success and trigger callback", async () => {
      const successDialogSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
      const onSuccess = vi.fn();

      vi.spyOn(authApi, "register").mockResolvedValueOnce({
        success: true,
        message: "Registered",
        data: { user: dummyUser },
      });

      const thunk = asyncRegister(
        {
          name: "Risky Kevin Naibaho",
          email: "ifs24038@delcom.org",
          password: "pwd",
        },
        onSuccess
      );
      const result = await thunk();

      expect(result).toBe(true);
      expect(successDialogSpy).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should handle register success without callback", async () => {
      vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      vi.spyOn(authApi, "register").mockResolvedValueOnce({
        success: true,
        message: "Registered",
        data: { user: dummyUser },
      });

      const thunk = asyncRegister({
        name: "Risky",
        email: "ifs24038@delcom.org",
        password: "pwd",
      });
      const result = await thunk();

      expect(result).toBe(true);
    });

    it("should handle register failure and show error dialog", async () => {
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(authApi, "register").mockResolvedValueOnce({
        success: false,
        message: "Email already taken",
      });

      const thunk = asyncRegister({
        name: "Risky",
        email: "ifs24038@delcom.org",
        password: "pwd",
      });
      const result = await thunk();

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith("Email already taken");
    });

    it("should fallback message on register failure when message is empty", async () => {
      const errorDialogSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      vi.spyOn(authApi, "register").mockResolvedValueOnce({
        success: false,
        message: "",
      });

      const thunk = asyncRegister({
        name: "Risky",
        email: "ifs24038@delcom.org",
        password: "pwd",
      });
      const result = await thunk();

      expect(result).toBe(false);
      expect(errorDialogSpy).toHaveBeenCalledWith(
        "Gagal mendaftar. Silakan coba lagi."
      );
    });
  });

  describe("asyncLogout", () => {
    it("should remove access token, dispatch logout, and call onSuccess", () => {
      const dispatch = vi.fn();
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken");
      const onSuccess = vi.fn();

      asyncLogout(onSuccess)(dispatch);

      expect(putTokenSpy).toHaveBeenCalledWith(null);
      expect(dispatch).toHaveBeenCalledWith(authLogoutAction());
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should handle logout without onSuccess callback", () => {
      const dispatch = vi.fn();
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken");

      asyncLogout()(dispatch);

      expect(putTokenSpy).toHaveBeenCalledWith(null);
      expect(dispatch).toHaveBeenCalledWith(authLogoutAction());
    });
  });
});

