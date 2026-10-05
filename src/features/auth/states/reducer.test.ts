import { describe, it, expect } from "vitest";
import { authReducer, initialAuthState } from "./reducer";
import { ActionType } from "@/types/action";
import { User } from "@/types";

describe("authReducer", () => {
  const dummyUser: User = {
    id: "user-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
  };

  it("should return the default state when given unknown action", () => {
    const nextState = authReducer(undefined, { type: "UNKNOWN_ACTION" });
    expect(nextState).toEqual(initialAuthState);
  });

  it("should handle AUTH_LOGIN_SUCCESS action", () => {
    const action = {
      type: ActionType.AUTH_LOGIN_SUCCESS,
      payload: {
        token: "jwt-token-xyz",
        user: dummyUser,
      },
    };

    const nextState = authReducer(initialAuthState, action);
    expect(nextState.token).toBe("jwt-token-xyz");
    expect(nextState.profile).toEqual(dummyUser);
    expect(nextState.isAuth).toBe(true);
  });

  it("should handle AUTH_LOGIN_SUCCESS with missing payload fields fallback", () => {
    const action = {
      type: ActionType.AUTH_LOGIN_SUCCESS,
      payload: {},
    };

    const nextState = authReducer(initialAuthState, action);
    expect(nextState.token).toBeNull();
    expect(nextState.profile).toBeNull();
    expect(nextState.isAuth).toBe(true);
  });

  it("should handle AUTH_LOGOUT action", () => {
    const loggedInState = {
      token: "jwt-token-xyz",
      profile: dummyUser,
      isAuth: true,
      loading: false,
    };

    const nextState = authReducer(loggedInState, {
      type: ActionType.AUTH_LOGOUT,
    });
    expect(nextState.token).toBeNull();
    expect(nextState.profile).toBeNull();
    expect(nextState.isAuth).toBe(false);
  });

  it("should handle AUTH_SET_PROFILE action", () => {
    const action = {
      type: ActionType.AUTH_SET_PROFILE,
      payload: { user: dummyUser },
    };

    const nextState = authReducer(initialAuthState, action);
    expect(nextState.profile).toEqual(dummyUser);
  });

  it("should handle AUTH_SET_PROFILE with missing payload fallback", () => {
    const action = {
      type: ActionType.AUTH_SET_PROFILE,
      payload: undefined,
    };

    const nextState = authReducer(initialAuthState, action);
    expect(nextState.profile).toBeNull();
  });
});

