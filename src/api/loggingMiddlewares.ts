import {
  Middleware,
  MiddlewareAPI,
  isFulfilled,
  isPending,
  isRejectedWithValue,
} from '@reduxjs/toolkit'

const shouldLogExpanded = false

/**
 * Log an error
 */
export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => next => action => {
    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
    if (isRejectedWithValue(action)) {
      const errorData =
        'data' in action.error
          ? (action.error.data as { message: string }).message
          : action.error.message
      const payload = JSON.stringify(action.payload, null, 4)
      console.error(
        'We got a rejected action!',
        `\n  error.data: "${errorData}"`,
        `\n  payload: ${payload}`,
      )
    }
    if (isFulfilled(action)) {
      if (shouldLogExpanded) {
        console.log('Fulfilled action:', action.meta.arg)
      }
    }

    return next(action)
  }
export const loggerMiddleware: Middleware = api => next => async action => {
  if (isPending(action)) {
    const arg = action.meta.arg
    if (typeof arg !== 'object' || !arg) return

    const endpointName =
      'endpointName' in arg ? (arg.endpointName as string) : undefined
    if (endpointName) {
      if (shouldLogExpanded) {
        console.log(`Request to ${endpointName} :`, arg)
      } else {
        console.log(`Request to ${endpointName}`)
      }
    }
  }

  return next(action)
}
