import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { User } from '../types/user'
import { Preferences } from '../types/preferences'
import { Review } from '../types/review'
import { Assignment } from '../types/assignment'
import { ReviewStatistic } from '../types/reviewStatistic'
import { Subject } from '../types/subject'
import { CreateReviewParams } from '../types/createReviewParams'
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../redux/store'
import { getLocalStartOfDayInUTC, isToday } from '../utils/dateUtils'
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
    prepareHeaders: headers => {
      // TODO: getState can be used here. See documentation of fetchBaseQuery
      if (apiKey) {
        headers.set('Authorization', `Bearer ${apiKey}`)
      }
      headers.set('Wanikani-Revision', '20170710')
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
    getSubjects: build.query<
      { data: Subject[]; hasMore: boolean; totalCount: number },
      { ids?: number[]; updatedAfter?: string; pageAfterId?: number }
    >({
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
              return { ...el.data, id: el.id, type } as Subject
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
      providesTags: result =>
        // TODO: check if this caching works correctly
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Subject' as const,
                id,
              })),
              'Subject',
            ]
          : ['Subject'],
    }),
    getAssignments: build.query<
      { data: Assignment[]; hasMore: boolean; totalCount: number },
      { updatedAfter?: string; pageAfterId?: number }
    >({
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
          el => ({ ...el.data, id: el.id }) as Assignment,
        )

        return {
          data,
          totalCount: response.total_count,
          hasMore: response.pages.next_url !== null,
        }
      },
      providesTags: result =>
        // TODO: check if this caching works correctly
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Assignment' as const,
                id,
              })),
              'Assignment',
            ]
          : ['Assignment'],
    }),
    getReviewStatistics: build.query<
      { data: ReviewStatistic[]; hasMore: boolean; totalCount: number },
      { updatedAfter?: string; pageAfterId?: number }
    >({
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
          el => ({ ...el.data, id: el.id }) as ReviewStatistic,
        )

        return {
          data,
          totalCount: response.total_count,
          hasMore: response.pages.next_url !== null,
        }
      },
      providesTags: result =>
        // TODO: check if this caching works correctly
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'ReviewStatistic' as const,
                id,
              })),
              'ReviewStatistic',
            ]
          : ['ReviewStatistic'],
    }),
    getReviews: build.query<Assignment[], void>({
      query: () => ({
        url: 'assignments',
        params: { immediately_available_for_review: true },
      }),
      transformResponse: (response: ApiResponse<ApiResponse<Assignment>[]>) =>
        response.data.map(el => ({ ...el.data, id: el.id })),
      providesTags: ['Reviews'],
    }),
    getLessons: build.query<Assignment[], void>({
      query: () => ({
        url: 'assignments',
        params: { immediately_available_for_lessons: true },
      }),
      transformResponse: (response: ApiResponse<ApiResponse<Assignment>[]>) =>
        response.data.map(el => ({ ...el.data, id: el.id })),
      providesTags: ['Lessons'],
    }),
    getLessonsCompletedToday: build.query<Assignment[], void>({
      query: () => ({
        url: 'assignments',
        params: { updated_after: getLocalStartOfDayInUTC(), started: true },
      }),
      transformResponse: (response: ApiResponse<ApiResponse<Assignment>[]>) => {
        const assignments: Assignment[] = response.data.map(el => ({
          ...el.data,
          id: el.id,
        }))
        const assignmentsCreatedToday = assignments.filter(el =>
          isToday(el.started_at),
        )
        return assignmentsCreatedToday
      },
      providesTags: ['Lessons'],
    }),
    // TODO: save result to db
    startAssignment: build.mutation<Assignment, number>({
      query: (id: number) => ({
        method: 'PUT',
        url: `assignments/${id}/start`,
      }),
      transformResponse: (response: ApiResponse<Assignment>) => ({
        ...response.data,
        id: response.id,
      }),
      invalidatesTags: ['Lessons'],
    }),
    createReview: build.mutation<
      [Review, CreateReviewResourcesUpdated],
      CreateReviewParams
    >({
      query: (params: CreateReviewParams) => ({
        method: 'POST',
        url: `reviews`,
        body: { review: params },
      }),
      transformResponse: (response: CreateReviewApiResponse) => [
        { ...response.data, id: response.id },
        {
          assignment: {
            ...response.resources_updated.assignment.data,
            id: response.resources_updated.assignment.id,
          },
          review_statistic: {
            ...response.resources_updated.review_statistic.data,
            id: response.resources_updated.review_statistic.id,
          },
        },
      ],
      invalidatesTags: ['Reviews'],
    }),
    getLevelProgressions: build.query<
      { data: LevelProgression[]; totalCount: number },
      { updatedAfter?: string; pageAfterId?: number }
    >({
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
        data: response.data.map(el => ({ ...el.data, id: el.id })),
        totalCount: response.total_count,
      }),
      providesTags: ['LevelProgressions'],
    }),
  }),
})

export const {
  useGetUserQuery,
  useGetLessonsQuery,
  useGetLessonsCompletedTodayQuery,
  useGetReviewsQuery,
  useGetSubjectsQuery,
  useGetAssignmentsQuery,
  useGetReviewStatisticsQuery,
  useGetLevelProgressionsQuery,

  useSetUserPreferencesMutation,
  useCreateReviewMutation,
  useStartAssignmentMutation,
} = wanikaniApi

export const selectLessons = createSelector(
  wanikaniApi.endpoints.getLessons.select(undefined),
  result => result.data ?? [],
)
const reviewsSelector = createSelector(
  wanikaniApi.endpoints.getReviews.select(undefined),
  result => result.data ?? [],
)

export const selectReviewsBatch = (state: RootState) => reviewsSelector(state)

const innerSelectAssignments = createSelector(
  selectLessons,
  reviewsSelector,
  (_: RootState, ids: number[]) => ids,
  (lessons, reviews, ids): Assignment[] => {
    const selected = lessons.concat(reviews).filter(el => ids.includes(el.id))
    selected.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
    return selected
  },
)
const innerSelectAssignment = createSelector(
  selectLessons,
  reviewsSelector,
  (_: RootState, id: number | undefined) => id,
  (lessons, reviews, id): Assignment | undefined => {
    if (id === undefined) return undefined

    return lessons.concat(reviews).find(el => el.id === id)
  },
)

export const selectAssignments = (ids: number[]) => (state: RootState) =>
  innerSelectAssignments(state, ids)

export const selectAssignment =
  (id: number | undefined) => (state: RootState) =>
    innerSelectAssignment(state, id)

export const selectLessonsCount = (state: RootState) =>
  selectLessons(state).length
export const selectReviewsCount = (state: RootState) =>
  reviewsSelector(state).length

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
