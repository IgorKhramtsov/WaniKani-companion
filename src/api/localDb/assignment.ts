import {
  SQL,
  and,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
} from 'drizzle-orm'
import { QueryBuilder } from 'drizzle-orm/sqlite-core'
import { localDbApi, transformDrizzleResponse, upsertTable } from './api'
import { Assignment } from '@/src/types/assignment'
import { assignmentsTable } from '@/src/db/schema'
import { dateToUnixTimestamp, getLocalDayStart } from '@/src/utils/dateUtils'

const qb = new QueryBuilder()
const table = assignmentsTable

export const localDbAssignmentsApi = localDbApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    saveAssignments: builder.mutation<void, Assignment[]>({
      invalidatesTags: ['Assignment'],
      query: assignments => upsertTable(table, assignments),
    }),
    getAssignment: builder.query<Assignment | undefined, number>({
      providesTags: ['Assignment'],
      query: subject_id =>
        qb.select().from(table).where(eq(table.subject_id, subject_id)).toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, table, false),
    }),
    getAssignments: builder.query<Assignment[], number[]>({
      providesTags: ['Assignment'],
      query: assignmentIds =>
        qb.select().from(table).where(inArray(table.id, assignmentIds)).toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    getAssignmentsForForecast: builder.query<Assignment[], void>({
      providesTags: ['Assignment'],
      // we want all reviews, we will use already available for the forecast
      query: () =>
        qb
          .select()
          .from(table)
          // Burned items will have started_at but not available_at. Fetch only
          // the ones that have started_at and available_at
          .where(
            and(isNotNull(table.started_at), isNotNull(table.available_at)),
          )
          .toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    findAssignmentsBy: builder.query<Assignment[], { subjectIds: number[] }>({
      providesTags: ['Assignment'],
      query: ({ subjectIds }) => {
        let sql: SQL[] = []
        if (subjectIds !== undefined && subjectIds.length > 0) {
          sql.push(inArray(table.subject_id, subjectIds))
        }
        return qb
          .select()
          .from(table)
          .where(and(...sql))
          .toSQL()
      },
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    getReviews: builder.query<Assignment[], void>({
      providesTags: ['Assignment'],
      query: () =>
        qb
          .select()
          .from(table)
          .where(lte(table.available_at, dateToUnixTimestamp(new Date())))
          .toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    getLessons: builder.query<Assignment[], void>({
      providesTags: ['Assignment'],
      query: () =>
        qb
          ?.select()
          .from(table)
          .where(
            and(
              lte(table.unlocked_at, dateToUnixTimestamp(new Date())),
              isNull(table.started_at),
            ),
          )
          .toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    getLessonsCompletedToday: builder.query<Assignment[], void>({
      providesTags: ['Assignment'],
      query: () =>
        qb
          .select()
          .from(table)
          .where(
            and(
              gte(table.updated_at, dateToUnixTimestamp(getLocalDayStart())),
              gte(table.started_at, dateToUnixTimestamp(getLocalDayStart())),
            ),
          )
          .toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
  }),
})

export const {
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useGetAssignmentsForForecastQuery,
  useGetReviewsQuery,
  useGetLessonsQuery,
  useGetLessonsCompletedTodayQuery,

  useFindAssignmentsByQuery,

  useSaveAssignmentsMutation,
} = localDbAssignmentsApi
