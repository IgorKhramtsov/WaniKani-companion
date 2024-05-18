import { configureStore } from "@reduxjs/toolkit";
import lessonsReducer from './lessonsSlice'

export const store = configureStore({
  reducer: {
    lessonsReducer,
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
