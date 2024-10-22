import { Middleware, configureStore } from '@reduxjs/toolkit'
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

const performanceLoggingEnabled = false
const timingMiddleware: Middleware = store => next => (action: any) => {
  // TODO: performance can be used to integrate measures in chrom profiler
  // https://gist.github.com/clarkbw/966732806e7a38f5b49fd770c62a6099
  if (!performanceLoggingEnabled) return next(action)

  if (!('type' in action)) return next(action)
  let name = action.type
  if (
    'meta' in action &&
    'arg' in action.meta &&
    'endpointName' in action.meta.arg
  ) {
    name = `${action.type}/${action.meta.arg.endpointName}`
  }
  console.time(name)
  let result = next(action)
  console.timeEnd(name)
  return result
}

export const createStore = (
  sqliteDb: SQLiteDatabase | null,
  apiKey: string | null,
) =>
  configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: { warnAfter: 300 },
        immutableCheck: { warnAfter: 300 },
        thunk: { extraArgument: { sqliteDb, apiKey } },
      }).concat(
        wanikaniApi.middleware,
        localDbApi.middleware,
        localSettingsApi.middleware,
        rtkQueryErrorLogger,
        loggerMiddleware,
        localDbSyncMiddleware,
        timingMiddleware,
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
    enhancers: getDefaultEnhancers =>
      getDefaultEnhancers()
        .concat(devToolsEnhancer({ trace: true }))
        .concat(sentryReduxEnhancer),
  })

const defaultStore = createStore(null, null)
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof defaultStore.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof defaultStore.dispatch
