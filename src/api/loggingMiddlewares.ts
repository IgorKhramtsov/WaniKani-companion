import {
  Middleware,
  MiddlewareAPI,
  isPending,
  isRejectedWithValue,
} from '@reduxjs/toolkit'

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

    return next(action)
  }
export const loggerMiddleware: Middleware = api => next => async action => {
  if (isPending(action)) {
    const arg = action.meta.arg
    if (typeof arg !== 'object' || !arg) return

    const endpointName =
      'endpointName' in arg ? (arg.endpointName as string) : undefined
    if (
      endpointName
      //   &&
      // Object.keys(wanikaniApi.endpoints).includes(endpointName)
    ) {
      console.log(`Request to ${endpointName} :`, arg)
    }
  }

  return next(action)
}
