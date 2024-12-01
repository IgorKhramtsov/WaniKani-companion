import {
  Middleware,
  combineReducers,
  configureStore,
  ThunkDispatch,
  ThunkAction as TAction,
} from '@reduxjs/toolkit'
import { subjectsSlice } from './subjectsSlice'
import { quizSlice } from './quizSlice'
import { settingsSlice } from './settingsSlice'
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
  // TODO: performance can be used to integrate measures in chrome profiler
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

const rootReducer = combineReducers({
  [subjectsSlice.reducerPath]: subjectsSlice.reducer,
  [quizSlice.reducerPath]: quizSlice.reducer,
  [settingsSlice.reducerPath]: settingsSlice.reducer,
  [wanikaniApi.reducerPath]: wanikaniApi.reducer,
  [localSettingsApi.reducerPath]: localSettingsApi.reducer,
  [localDbApi.reducerPath]: localDbApi.reducer,
})

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
    reducer: rootReducer,
    devTools: false,
    enhancers: getDefaultEnhancers => {
      const enhancers = getDefaultEnhancers().concat(sentryReduxEnhancer)
      return enhancers.concat(
        devToolsEnhancer({
          name: 'Wanikani Companion',
          trace: true,
          maxAge: 100,
          actionsDenylist: [
            'localDbApi/.*',
            'wanikaniApi/.*',
            'localSettingsApi/.*',
          ],
        }),
      )
    },
  })

export type RootState = ReturnType<typeof rootReducer>

type SubjectsSliceAction = ReturnType<
  (typeof subjectsSlice.actions)[keyof typeof subjectsSlice.actions]
>
type QuizSliceAction = ReturnType<
  (typeof quizSlice.actions)[keyof typeof quizSlice.actions]
>
type SettingsSliceAction = ReturnType<
  (typeof settingsSlice.actions)[keyof typeof settingsSlice.actions]
>
type WanikaniApiAction = ReturnType<
  (typeof wanikaniApi.internalActions)[keyof typeof wanikaniApi.internalActions]
>
type LocalSettingsApiAction = ReturnType<
  (typeof localSettingsApi.internalActions)[keyof typeof localSettingsApi.internalActions]
>
type LocalDbApiAction = ReturnType<
  (typeof localDbApi.internalActions)[keyof typeof localDbApi.internalActions]
>

type Action =
  | SubjectsSliceAction
  | QuizSliceAction
  | SettingsSliceAction
  | WanikaniApiAction
  | LocalSettingsApiAction
  | LocalDbApiAction
export type ThunkAction = TAction<any, RootState, any, Action>
export interface AppDispatch extends ThunkDispatch<RootState, any, Action> {
  <Action>(
    action: Action,
  ): Action extends (...args: any) => infer R ? R : Action
}
