import { configureStore } from '@reduxjs/toolkit'
import assignmentsSlice from './assignmentsSlice'
import subjectsSlice from './subjectsSlice'
import reviewSlice from './reviewSlice'

export const store = configureStore({
  reducer: {
    assignmentsSlice,
    subjectsSlice,
    reviewSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
