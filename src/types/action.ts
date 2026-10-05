import { Post, User } from "./index";

export const ActionType = {
  // Auth
  AUTH_LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  AUTH_LOGOUT: "AUTH_LOGOUT",
  AUTH_SET_PROFILE: "AUTH_SET_PROFILE",

  // Posts
  POSTS_RECEIVE: "POSTS_RECEIVE",
  POST_DETAIL_RECEIVE: "POST_DETAIL_RECEIVE",
  POST_CLEAR_DETAIL: "POST_CLEAR_DETAIL",
  POST_ADD: "POST_ADD",
  POST_UPDATE: "POST_UPDATE",
  POST_DELETE: "POST_DELETE",
  POST_TOGGLE_LIKE: "POST_TOGGLE_LIKE",
  POST_ADD_COMMENT: "POST_ADD_COMMENT",
  POST_DELETE_COMMENT: "POST_DELETE_COMMENT",
  POSTS_DELETE_ALL_MINE: "POSTS_DELETE_ALL_MINE",

  // Users
  USERS_RECEIVE: "USERS_RECEIVE",
  USER_PROFILE_RECEIVE: "USER_PROFILE_RECEIVE",
} as const;

export interface AnyAction {
  type: string;
  payload?: any;
}

export interface AuthState {
  token: string | null;
  profile: User | null;
  isAuth: boolean;
  loading: boolean;
}

export interface PostsState {
  posts: Post[];
  detailPost: Post | null;
  loading: boolean;
}

export interface UsersState {
  users: User[];
  profile: User | null;
  loading: boolean;
}
