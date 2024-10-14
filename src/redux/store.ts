import { configureStore } from '@reduxjs/toolkit'
import subjectsSlice from './subjectsSlice'
import quizSlice from './quizSlice'
import settingsSlice from './settingsSlice'
import { wanikaniApi } from '@/src/api/wanikaniApi'
import { localSettingsApi } from '../api/localStorageApi'
import {
  loggerMiddleware,
  rtkQueryErrorLogger,
} from '../api/loggingMiddlewares'
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin'
import { SQLiteDatabase } from 'expo-sqlite'
import { localDbSyncMiddleware } from '../api/localDbSyncMiddleware'
import * as Sentry from '@sentry/react-native'
import { localDbApi } from '../api/localDb/api'

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  attachReduxState: false, // The state could easily be more than 1 mb
})

export const createStore = (sqliteDb?: SQLiteDatabase) =>
  configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: { warnAfter: 300 },
        immutableCheck: { warnAfter: 300 },
        thunk: { extraArgument: { sqliteDb } },
      }).concat(
        wanikaniApi.middleware,
        localDbApi.middleware,
        localSettingsApi.middleware,
        rtkQueryErrorLogger,
        loggerMiddleware,
        localDbSyncMiddleware,
      ),
    reducer: {
      subjectsSlice,
      quizSlice,
      settingsSlice,
      [wanikaniApi.reducerPath]: wanikaniApi.reducer,
      [localSettingsApi.reducerPath]: localSettingsApi.reducer,
      [localDbApi.reducerPath]: localDbApi.reducer,
    },
    devTools: false,
    // NOTE: This is not an error
    enhancers: getDefaultEnhancers =>
      getDefaultEnhancers()
        .concat(devToolsEnhancer())
        .concat(sentryReduxEnhancer),
  })

const defaultStore = createStore(undefined)
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof defaultStore.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof defaultStore.dispatch
