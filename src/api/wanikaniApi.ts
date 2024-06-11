import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { User } from '../types/user'
import { Preferences } from '../types/preferences'
import {
  Middleware,
  MiddlewareAPI,
  isPending,
  isRejectedWithValue,
} from '@reduxjs/toolkit'
import { Review } from '../types/review'
import { Assignment } from '../types/assignment'
import { ReviewStatistic } from '../types/reviewStatistic'

// TODO: maybe refactor in future to look more like a data source which is
// injected to redux store?
//
// TODO: add api key verification (by making empty request to server) to check
// permissions and disable app's features if not authorized.
let apiKey: string | undefined
export const setApiKey = (key: string) => {
  apiKey = key
}
export const getApiKey = () => apiKey

export const wanikaniApi = createApi({
  reducerPath: 'wanikaniApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.wanikani.com/v2/',
    prepareHeaders: headers => {
      // TODO: getState can be used here. See documentation of fetchBaseQuery
      if (apiKey) {
        headers.set('Authorization', `Bearer ${apiKey}`)
      }
      headers.set('Wanikani-Revision', '20170710')
    },
  }),
  tagTypes: ['User'],
  endpoints: build => ({
    getUser: build.query<User, void>({
      query: () => 'user',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['User'],
    }),
    setUserPreferences: build.mutation<User, Preferences>({
      query: (preferences: Preferences) => ({
        method: 'PUT',
        url: 'user',
        body: { user: { preferences } },
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['User'],
      onQueryStarted: (arg, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          wanikaniApi.util.updateQueryData(
            'getUser',
            undefined,
            (draft: User) => {
              Object.assign(draft.preferences, arg)
            },
          ),
        )
        queryFulfilled
          .then(data => {
            dispatch(
              wanikaniApi.util.updateQueryData(
                'getUser',
                undefined,
                (draft: User) => {
                  Object.assign(draft, data.data)
                },
              ),
            )
          })
          .catch(patchResult.undo)
      },
    }),
  }),
})

export const { useGetUserQuery, useSetUserPreferencesMutation } = wanikaniApi

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
      endpointName &&
      Object.keys(wanikaniApi.endpoints).includes(endpointName)
    ) {
      console.log(`Request to ${endpointName} :`, arg)
    }
  }

  return next(action)
}

/**
 * Checks if a given type is a valid SubjectType.
 *
 * @param type - The type to check.
 * @returns True if the type is one of 'radical', 'kanji', 'vocabulary', or 'kana_vocabulary'.
 */
function isValidSubjectType(
  type: string,
): type is 'radical' | 'kanji' | 'vocabulary' | 'kana_vocabulary' {
  return ['radical', 'kanji', 'vocabulary', 'kana_vocabulary'].includes(type)
}

interface ApiResponse<T> {
  id: number
  object: 'assignment' | string
  url: string
  data_updated_at: Date | null
  data: T
}

interface CreateReviewApiResponse {
  id: number
  object: 'assignment' | string
  url: string
  data_updated_at: Date | null
  data: Review
  resources_updated: CreateReviewResourcesUpdated
}

interface CreateReviewResourcesUpdated {
  assignment: Assignment
  review_statistic: ReviewStatistic
}
