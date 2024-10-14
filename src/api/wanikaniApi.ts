import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { User } from '../types/user'
import { Preferences } from '../types/preferences'
import { Review } from '../types/review'
import { Assignment } from '../types/assignment'
import { ReviewStatistic } from '../types/reviewStatistic'
import { Subject } from '../types/subject'
import { CreateReviewParams } from '../types/createReviewParams'
import { dateToUnixTimestamp } from '../utils/dateUtils'
import { LevelProgression } from '../types/levelProgression'

// TODO: maybe refactor in future to look more like a data source which is
// injected to redux store?
//
// TODO: add api key verification (by making empty request to server) to check
// permissions and disable app's features if not authorized.
//
// TODO: Rewrite to React Query (tanstack)
//
// TODO: update assignments table of local db with data after completing
// review/lesson
let apiKey: string | undefined
export const setApiKey = (key: string) => {
  apiKey = key
}
export const getApiKey = () => apiKey

export const wanikaniApi = createApi({
  reducerPath: 'wanikaniApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.wanikani.com/v2/',
    validateStatus(response, body) {
      // We don't want to treat 304(not modified) as an error.
      //
      // NOTE: fetchApi in production will use cache headers and 304 will be a
      // common response.
      return (
        response.status === 304 ||
        (response.status >= 200 && response.status < 300)
      )
    },
    prepareHeaders: headers => {
      // TODO: getState can be used here. See documentation of fetchBaseQuery
      if (apiKey) {
        headers.set('Authorization', `Bearer ${apiKey}`)
      }
      headers.set('Wanikani-Revision', '20170710')
      // headers.set('if-modified-since', 'Fri, 12 Oct 2024 16:30:03 GMT') //
      // To debug 304
    },
  }),
  tagTypes: [
    'User',
    'Subject',
    'Assignment',
    'ReviewStatistic',
    'Reviews',
    'Lessons',
    'LevelProgressions',
  ],
  endpoints: build => ({
    getUser: build.query<User, void>({
      providesTags: ['User'],
      query: () => 'user',
      transformResponse: (response: ApiResponse<User>) =>
        transformValues(response.data),
    }),
    setUserPreferences: build.mutation<User, Preferences>({
      invalidatesTags: ['User'],
      query: (preferences: Preferences) => ({
        method: 'PUT',
        url: 'user',
        body: { user: { preferences } },
      }),
      transformResponse: (response: ApiResponse<User>) =>
        transformValues(response.data),
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
    getSubjects: build.query<
      { data: Subject[]; hasMore: boolean; totalCount: number },
      { ids?: number[]; updatedAfter?: string; pageAfterId?: number }
    >({
      providesTags: ['Subject'],
      query: ({ ids, updatedAfter, pageAfterId }) => {
        const params: {
          ids?: string
          updated_after?: string
          page_after_id?: number
        } = {}
        if (ids && ids.length > 0) {
          params['ids'] = ids.join(',')
        }
        if (updatedAfter) {
          params['updated_after'] = updatedAfter
        }
        if (pageAfterId) {
          params['page_after_id'] = pageAfterId
        }
        return {
          url: 'subjects',
          params,
        }
      },
      transformResponse: (response: ApiResponse<ApiResponse<Subject>[]>) => {
        const data = response.data
          .map(el => {
            const type = el.object
            if (isValidSubjectType(type)) {
              return transformValues({ ...el.data, id: el.id, type }) as Subject
            } else {
              console.error('Unknown subject type: ', type)
              return undefined
            }
          })
          .filter((el): el is Subject => el !== undefined)

        return {
          data,
          totalCount: response.total_count,
          hasMore: response.pages.next_url !== null,
        }
      },
    }),
    getAssignments: build.query<
      { data: Assignment[]; hasMore: boolean; totalCount: number },
      { updatedAfter?: string; pageAfterId?: number }
    >({
      providesTags: ['Assignment'],
      query: ({ updatedAfter, pageAfterId }) => {
        const params: {
          ids?: string
          updated_after?: string
          page_after_id?: number
        } = {}
        if (updatedAfter) {
          params['updated_after'] = updatedAfter
        }
        if (pageAfterId) {
          params['page_after_id'] = pageAfterId
        }
        return {
          url: 'assignments',
          params,
        }
      },
      transformResponse: (response: ApiResponse<ApiResponse<Assignment>[]>) => {
        const data = response.data.map(
          el =>
            transformValues({
              ...el.data,
              updated_at: el.data_updated_at,
              id: el.id,
            }) as Assignment,
        )

        return {
          data,
          totalCount: response.total_count,
          hasMore: response.pages.next_url !== null,
        }
      },
    }),
    getReviewStatistics: build.query<
      { data: ReviewStatistic[]; hasMore: boolean; totalCount: number },
      { updatedAfter?: string; pageAfterId?: number }
    >({
      providesTags: ['ReviewStatistic'],
      query: ({ updatedAfter, pageAfterId }) => {
        const params: {
          ids?: string
          updated_after?: string
          page_after_id?: number
        } = {}
        if (updatedAfter) {
          params['updated_after'] = updatedAfter
        }
        if (pageAfterId) {
          params['page_after_id'] = pageAfterId
        }
        return {
          url: 'review_statistics',
          params,
        }
      },
      transformResponse: (
        response: ApiResponse<ApiResponse<ReviewStatistic>[]>,
      ) => {
        const data = response.data.map(
          el => transformValues({ ...el.data, id: el.id }) as ReviewStatistic,
        )

        return {
          data,
          totalCount: response.total_count,
          hasMore: response.pages.next_url !== null,
        }
      },
    }),
    startAssignment: build.mutation<Assignment, number>({
      invalidatesTags: ['Lessons'],
      query: (id: number) => ({
        method: 'PUT',
        url: `assignments/${id}/start`,
      }),
      transformResponse: (response: ApiResponse<Assignment>) =>
        transformValues({
          ...response.data,
          updated_at: response.data_updated_at,
          id: response.id,
        }),
    }),
    createReview: build.mutation<
      [Review, CreateReviewResourcesUpdated],
      CreateReviewParams
    >({
      invalidatesTags: ['Reviews'],
      query: (params: CreateReviewParams) => ({
        method: 'POST',
        url: `reviews`,
        body: { review: params },
      }),
      transformResponse: (response: CreateReviewApiResponse) => [
        transformValues({ ...response.data, id: response.id }),
        {
          assignment: transformValues({
            ...response.resources_updated.assignment.data,
            updated_at: response.resources_updated.assignment.data_updated_at,
            id: response.resources_updated.assignment.id,
          }),
          review_statistic: transformValues({
            ...response.resources_updated.review_statistic.data,
            updated_at:
              response.resources_updated.review_statistic.data_updated_at,
            id: response.resources_updated.review_statistic.id,
          }),
        },
      ],
    }),
    getLevelProgressions: build.query<
      { data: LevelProgression[]; totalCount: number },
      { updatedAfter?: string; pageAfterId?: number }
    >({
      providesTags: ['LevelProgressions'],
      query: ({ updatedAfter, pageAfterId }) => {
        const params: {
          ids?: string
          updated_after?: string
          page_after_id?: number
        } = {}
        if (updatedAfter) {
          params['updated_after'] = updatedAfter
        }
        if (pageAfterId) {
          params['page_after_id'] = pageAfterId
        }
        return {
          url: 'level_progressions',
          params,
        }
      },
      transformResponse: (
        response: ApiResponse<ApiResponse<LevelProgression>[]>,
      ) => ({
        data: response.data.map(el =>
          transformValues({ ...el.data, id: el.id }),
        ),
        totalCount: response.total_count,
      }),
    }),
  }),
})

export const {
  useGetUserQuery,
  useGetSubjectsQuery,
  useGetAssignmentsQuery,
  useGetReviewStatisticsQuery,
  useGetLevelProgressionsQuery,

  useSetUserPreferencesMutation,
  useCreateReviewMutation,
  useStartAssignmentMutation,
} = wanikaniApi

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

const transformValues = <T extends object>(input: any): T => {
  for (const key in input) {
    if (key.endsWith('_at') && typeof input[key] === 'string') {
      // if (key === 'available_at') {
      //   console.log(
      //     'converrting',
      //     input[key],
      //     new Date(input[key]),
      //     dateToUnixTimestamp(new Date(input[key])),
      //     new Date(dateToUnixTimestamp(new Date(input[key]))),
      //   )
      // }
      input[key] = dateToUnixTimestamp(new Date(input[key]))
    }
  }

  return input as T
}

interface ApiResponse<T> {
  id: number
  object: 'assignment' | string
  url: string
  data_updated_at: Date | null
  total_count: number
  pages: {
    per_page: number
    next_url: string | null
    previous_url: string | null
  }
  data: T
}

interface CreateReviewApiResponse {
  id: number
  object: 'assignment' | string
  url: string
  data_updated_at: Date | null
  data: Review
  resources_updated: CreateReviewResourcesUpdatedResponse
}

interface CreateReviewResourcesUpdatedResponse {
  assignment: ApiResponse<Assignment>
  review_statistic: ApiResponse<ReviewStatistic>
}

interface CreateReviewResourcesUpdated {
  assignment: Assignment
  review_statistic: ReviewStatistic
}
