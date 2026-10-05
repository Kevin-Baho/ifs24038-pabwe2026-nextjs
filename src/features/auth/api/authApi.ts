import { _fetchWithAuth } from "@/helpers/apiHelper";
import {
  ApiResult,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<ApiResult<LoginResponse>> {
    return _fetchWithAuth<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async register(
    payload: RegisterPayload
  ): Promise<ApiResult<RegisterResponse>> {
    return _fetchWithAuth<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

