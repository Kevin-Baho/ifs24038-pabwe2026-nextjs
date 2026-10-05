import { _fetchWithAuth } from "@/helpers/apiHelper";
import {
  ApiResult,
  ChangePasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/types";

export interface UsersResponse {
  users: User[];
}

export interface UserMeResponse {
  user: User;
}

export const userApi = {
  async getUsers(): Promise<ApiResult<UsersResponse>> {
    return _fetchWithAuth<UsersResponse>("/users", {
      method: "GET",
    });
  },

  async getMe(): Promise<ApiResult<UserMeResponse>> {
    return _fetchWithAuth<UserMeResponse>("/users/me", {
      method: "GET",
    });
  },

  async updateMe(
    payload: UpdateProfilePayload
  ): Promise<ApiResult<UserMeResponse>> {
    return _fetchWithAuth<UserMeResponse>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updatePhoto(photoFile: File): Promise<ApiResult<UserMeResponse>> {
    const formData = new FormData();
    formData.append("photo", photoFile);

    return _fetchWithAuth<UserMeResponse>("/users/me/photo", {
      method: "POST",
      body: formData,
    });
  },

  async updatePassword(payload: ChangePasswordPayload): Promise<ApiResult> {
    return _fetchWithAuth("/users/me/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

