import { ActionType } from "@/types/action";
import { User, UpdateProfilePayload, ChangePasswordPayload } from "@/types";
import { userApi } from "../api/userApi";
import { setAuthProfileAction } from "@/features/auth/states/action";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { AppDispatch } from "@/store";

export function receiveUsersAction(users: User[]) {
  return {
    type: ActionType.USERS_RECEIVE,
    payload: { users },
  };
}

export function receiveUserProfileAction(user: User) {
  return {
    type: ActionType.USER_PROFILE_RECEIVE,
    payload: { user },
  };
}

export function asyncReceiveUsers() {
  return async (dispatch: AppDispatch) => {
    const result = await userApi.getUsers();
    if (result.success && result.data?.users) {
      dispatch(receiveUsersAction(result.data.users));
      return result.data.users;
    } else {
      await showErrorDialog(result.message || "Gagal memuat daftar pengguna.");
      return [];
    }
  };
}

export function asyncReceiveProfile() {
  return async (dispatch: AppDispatch) => {
    const result = await userApi.getMe();
    if (result.success && result.data?.user) {
      dispatch(receiveUserProfileAction(result.data.user));
      dispatch(setAuthProfileAction(result.data.user));
      return result.data.user;
    } else {
      await showErrorDialog(result.message || "Gagal memuat data profil.");
      return null;
    }
  };
}

export function asyncUpdateProfile(
  payload: UpdateProfilePayload,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const result = await userApi.updateMe(payload);
    if (result.success && result.data?.user) {
      dispatch(receiveUserProfileAction(result.data.user));
      dispatch(setAuthProfileAction(result.data.user));
      await showSuccessDialog("Profil berhasil diperbarui!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal memperbarui profil.");
      return false;
    }
  };
}

export function asyncUpdatePhoto(photoFile: File, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    const result = await userApi.updatePhoto(photoFile);
    if (result.success && result.data?.user) {
      dispatch(receiveUserProfileAction(result.data.user));
      dispatch(setAuthProfileAction(result.data.user));
      await showSuccessDialog("Foto profil berhasil diperbarui!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal memperbarui foto profil.");
      return false;
    }
  };
}

export function asyncUpdatePassword(
  payload: ChangePasswordPayload,
  onSuccess?: () => void
) {
  return async () => {
    const result = await userApi.updatePassword(payload);
    if (result.success) {
      await showSuccessDialog("Kata sandi berhasil diperbarui!");
      onSuccess?.();
      return true;
    } else {
      await showErrorDialog(result.message || "Gagal memperbarui kata sandi.");
      return false;
    }
  };
}

