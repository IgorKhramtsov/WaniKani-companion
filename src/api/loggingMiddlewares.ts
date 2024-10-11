import {
  Middleware,
  MiddlewareAPI,
  isFulfilled,
  isPending,
  isRejectedWithValue,
} from '@reduxjs/toolkit'

const shouldLogExpanded = true
const enableLogging = true
const log = (msg: any, ...params: any[]) => {
  if (enableLogging) console.log('[api]', msg, ...params)
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logExpanded = (msg: any, ...params: any[]) => {
  if (shouldLogExpanded) log(msg, ...params)
}

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
      let requestDetails = undefined
      if (hasRTKQMeta(action)) {
        const baseQueryMeta = action.meta.baseQueryMeta
        requestDetails =
          `(${baseQueryMeta.response?.status ?? 'UNKNOWN'})` +
          baseQueryMeta.request.method +
          baseQueryMeta.request.url
      }
      console.error(
        '[api]',
        'We got a rejected action!',
        `\n  error.data: "${errorData}"`,
        `\n  payload: ${payload}`,
        requestDetails,
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
    log('Started request', endpointName)
  }
  if (isFulfilled(action)) {
    const arg = action.meta.arg
    if (typeof arg !== 'object' || !arg) return
    const endpointName =
      'endpointName' in arg ? (arg.endpointName as string) : undefined

    if (hasRTKQMeta(action)) {
      const baseQueryMeta = action.meta.baseQueryMeta

      log(
        'Finished request',
        `(${baseQueryMeta.response?.status ?? 'UNKNOWN'})`,
        endpointName,
        baseQueryMeta.request.method,
        baseQueryMeta.request.url,
      )
    }
  }

  return next(action)
}

const hasRTKQMeta = (
  action: any,
): action is {
  meta: {
    baseQueryMeta: {
      request: Request
      response?: Response
    }
  }
} => action?.meta?.baseQueryMeta?.request instanceof Request
