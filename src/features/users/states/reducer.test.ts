import { describe, it, expect } from "vitest";
import { usersReducer, initialUsersState } from "./reducer";
import { ActionType } from "@/types/action";
import { User } from "@/types";

describe("usersReducer", () => {
  const dummyUser: User = {
    id: "user-1",
    name: "Risky Kevin Naibaho",
    email: "ifs24038@delcom.org",
  };

  it("should return default state when given unknown action", () => {
    const nextState = usersReducer(undefined, { type: "UNKNOWN_ACTION" });
    expect(nextState).toEqual(initialUsersState);
  });

  it("should handle USERS_RECEIVE action", () => {
    const action = {
      type: ActionType.USERS_RECEIVE,
      payload: { users: [dummyUser] },
    };

    const nextState = usersReducer(initialUsersState, action);
    expect(nextState.users).toHaveLength(1);
    expect(nextState.users[0]).toEqual(dummyUser);
  });

  it("should handle USERS_RECEIVE with missing payload fallback", () => {
    const action = {
      type: ActionType.USERS_RECEIVE,
      payload: undefined,
    };

    const nextState = usersReducer(initialUsersState, action);
    expect(nextState.users).toEqual([]);
  });

  it("should handle USER_PROFILE_RECEIVE action", () => {
    const action = {
      type: ActionType.USER_PROFILE_RECEIVE,
      payload: { user: dummyUser },
    };

    const nextState = usersReducer(initialUsersState, action);
    expect(nextState.profile).toEqual(dummyUser);
  });

  it("should handle USER_PROFILE_RECEIVE with missing payload fallback", () => {
    const action = {
      type: ActionType.USER_PROFILE_RECEIVE,
      payload: undefined,
    };

    const nextState = usersReducer(initialUsersState, action);
    expect(nextState.profile).toBeNull();
  });
});

