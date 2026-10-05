import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./features/auth/states/reducer";
import { usersReducer } from "./features/users/states/reducer";
import { postsReducer } from "./features/posts/states/reducer";

export const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  posts: postsReducer,
});

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

export const store = createAppStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = typeof store.dispatch;

