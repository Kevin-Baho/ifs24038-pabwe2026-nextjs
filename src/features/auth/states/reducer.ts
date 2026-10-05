import { ActionType, AuthState } from "@/types/action";
import { getAccessToken } from "@/helpers/apiHelper";
import { User } from "@/types";

interface AuthAction {
  type: string;
  payload?: {
    token?: string;
    user?: User;
  };
}

const initialToken = getAccessToken();

export const initialAuthState: AuthState = {
  token: initialToken,
  profile: null,
  isAuth: Boolean(initialToken),
  loading: false,
};

export function authReducer(
  state: AuthState = initialAuthState,
  action: AuthAction = { type: "" }
): AuthState {
  switch (action.type) {
    case ActionType.AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload?.token || null,
        profile: action.payload?.user || null,
        isAuth: true,
        loading: false,
      };
    case ActionType.AUTH_LOGOUT:
      return {
        ...state,
        token: null,
        profile: null,
        isAuth: false,
        loading: false,
      };
    case ActionType.AUTH_SET_PROFILE:
      return {
        ...state,
        profile: action.payload?.user || null,
      };
    default:
      return state;
  }
}

