import { configureStore } from '@reduxjs/toolkit'
import assignmentsSlice from './assignmentsSlice'
import subjectsSlice from './subjectsSlice'
import quizSlice from './quizSlice'
import settingsSlice from './settingsSlice'
import {
  loggerMiddleware,
  rtkQueryErrorLogger,
  wanikaniApi,
} from '@/src/api/wanikaniApi'
import { localSettingsApi } from '../api/localStorageApi'

export const store = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: { warnAfter: 300 },
      immutableCheck: { warnAfter: 300 },
    }).concat(
      wanikaniApi.middleware,
      localSettingsApi.middleware,
      rtkQueryErrorLogger,
      loggerMiddleware,
    ),
  reducer: {
    assignmentsSlice,
    subjectsSlice,
    quizSlice,
    settingsSlice,
    [wanikaniApi.reducerPath]: wanikaniApi.reducer,
    [localSettingsApi.reducerPath]: localSettingsApi.reducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
