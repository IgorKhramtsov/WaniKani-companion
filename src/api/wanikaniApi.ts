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

// TODO: rewrite axios api to rtk query
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
  tagTypes: ['User', 'Subject', 'Reviews', 'Lessons'],
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
    getSubjects: build.query<Subject[], number[]>({
      query: (ids: number[]) => ({
        url: 'subjects',
        params: { ids: ids.join(',') },
      }),
      transformResponse: (response: ApiResponse<ApiResponse<Subject>[]>) => {
        return response.data
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
      },
      providesTags: result =>
        // TODO: check if this caching works correctly
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Subject' as const, id })),
              'Subject',
            ]
          : ['Subject'],
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
        response.data,
        response.resources_updated,
      ],
      invalidatesTags: ['Reviews'],
    }),
  }),
})

export const {
  useGetUserQuery,
  useGetLessonsQuery,
  useGetReviewsQuery,
  useGetSubjectsQuery,

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
  (lessons, reviews, ids): Assignment[] =>
    lessons.concat(reviews).filter(el => ids.includes(el.id)),
)

export const selectAssignments = (ids: number[]) => (state: RootState) =>
  innerSelectAssignments(state, ids)

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
