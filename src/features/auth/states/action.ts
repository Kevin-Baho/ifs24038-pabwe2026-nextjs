import { ActionType } from "@/types/action";
import { User, LoginPayload, RegisterPayload } from "@/types";
import { authApi } from "../api/authApi";
import { putAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { AppDispatch } from "@/store";

export function authLoginSuccessAction(token: string, user: User) {
  return {
    type: ActionType.AUTH_LOGIN_SUCCESS,
    payload: { token, user },
  };
}

export function authLogoutAction() {
  return {
    type: ActionType.AUTH_LOGOUT,
  };
}

export function setAuthProfileAction(user: User) {
  return {
    type: ActionType.AUTH_SET_PROFILE,
    payload: { user },
  };
}

export function asyncLogin(payload: LoginPayload, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    const result = await authApi.login(payload);
    if (result.success && result.data?.token) {
      putAccessToken(result.data.token);
      dispatch(authLoginSuccessAction(result.data.token, result.data.user));
      await showSuccessDialog("Login berhasil! Selamat datang kembali.");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal masuk. Silakan periksa kredensial Anda.");
      return false;
    }
  };
}

export function asyncRegister(payload: RegisterPayload, onSuccess?: () => void) {
  return async () => {
    const result = await authApi.register(payload);
    if (result.success) {
      await showSuccessDialog("Pendaftaran akun berhasil! Silakan masuk.");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal mendaftar. Silakan coba lagi.");
      return false;
    }
  };
}

export function asyncLogout(onSuccess?: () => void) {
  return (dispatch: AppDispatch) => {
    putAccessToken(null);
    dispatch(authLogoutAction());
    onSuccess?.();
  };
}

