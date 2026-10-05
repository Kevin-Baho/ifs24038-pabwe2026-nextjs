import { ActionType, UsersState } from "@/types/action";
import { User } from "@/types";

interface UsersAction {
  type: string;
  payload?: {
    users?: User[];
    user?: User;
  };
}

export const initialUsersState: UsersState = {
  users: [],
  profile: null,
  loading: false,
};

export function usersReducer(
  state: UsersState = initialUsersState,
  action: UsersAction = { type: "" }
): UsersState {
  switch (action.type) {
    case ActionType.USERS_RECEIVE:
      return {
        ...state,
        users: action.payload?.users || [],
        loading: false,
      };
    case ActionType.USER_PROFILE_RECEIVE:
      return {
        ...state,
        profile: action.payload?.user || null,
        loading: false,
      };
    default:
      return state;
  }
}

