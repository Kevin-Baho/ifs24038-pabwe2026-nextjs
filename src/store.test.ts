import { describe, it, expect } from "vitest";
import { store, createAppStore, rootReducer } from "./store";

describe("Redux Store", () => {
  it("should initialize store with default root reducers", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("users");
    expect(state).toHaveProperty("posts");
  });

  it("should allow creating custom store with preloadedState", () => {
    const customStore = createAppStore({
      auth: {
        token: "test-token",
        profile: null,
        isAuth: true,
        loading: false,
      },
    });
    expect(customStore.getState().auth.token).toBe("test-token");
    expect(customStore.getState().auth.isAuth).toBe(true);
  });

  it("should combine all slice reducers in rootReducer", () => {
    const initialRoot = rootReducer(undefined, { type: "@@INIT" });
    expect(initialRoot.auth).toBeDefined();
    expect(initialRoot.users).toBeDefined();
    expect(initialRoot.posts).toBeDefined();
  });
});

