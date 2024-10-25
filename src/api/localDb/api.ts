import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import {
  SQLiteBindValue,
  SQLiteDatabase,
  SQLiteVariadicBindParams,
} from 'expo-sqlite'
import {
  AnySQLiteColumn,
  QueryBuilder,
  SQLiteTableWithColumns,
  TableConfig,
  getTableConfig,
} from 'drizzle-orm/sqlite-core'
import '@/src/db/schema'
import {
  Query,
  eq,
  lt,
  gte,
  and,
  getTableColumns,
  or,
  inArray,
} from 'drizzle-orm'
import {
  levelProgressionsTable,
  reviewStatisticsTable,
  reviewsTable,
  studyMaterialsTable,
} from '@/src/db/schema'
import { ReviewStatistic } from '@/src/types/reviewStatistic'
import { Review } from '@/src/types/review'
import { LevelProgression } from '@/src/types/levelProgression'
import {
  dateToUnixTimestamp,
  getLocalDayAgoTime,
  getLocalDayStart,
} from '@/src/utils/dateUtils'
import { StudyMaterial } from '@/src/types/studyMaterial'

const qb = new QueryBuilder()

const baseQueryWithSqlite =
  (db: SQLiteDatabase): BaseQueryFn<Query, unknown, unknown, any, any> =>
  async ({ sql, params }, api, extraOptions) => {
    const statement = await db.prepareAsync(sql)
    try {
      const result = await statement.executeAsync(
        params as SQLiteVariadicBindParams,
      )
      const values = await result.getAllAsync()
      return { data: values }
    } catch (error) {
      return { error }
    } finally {
      await statement.finalizeAsync()
    }
  }

export const localDbApi = createApi({
  reducerPath: 'localDbApi',
  baseQuery: (args: Query, api, extraOptions) => {
    const { sqliteDb } = api.extra as any
    if (!sqliteDb) {
      throw new Error('sqliteDb is required')
    }
    const queryFn = baseQueryWithSqlite(sqliteDb)
    return queryFn(args, api, extraOptions)
  },
  tagTypes: [
    'Subject',
    'Assignment',
    'ReviewStatistic',
    'Review',
    'LevelProgression',
    'StudyMaterial',
  ],
  endpoints: builder => ({
    saveReviewStatistics: builder.mutation<void, ReviewStatistic[]>({
      invalidatesTags: ['ReviewStatistic'],
      query: reviewStatistics =>
        upsertTable(reviewStatisticsTable, reviewStatistics),
    }),
    getReviewStatistic: builder.query<ReviewStatistic | undefined, number>({
      providesTags: ['ReviewStatistic'],
      query: subject_id =>
        qb
          .select()
          .from(reviewStatisticsTable)
          .where(eq(reviewStatisticsTable.subject_id, subject_id))
          .toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, reviewStatisticsTable, false),
    }),
    getCriticalConditionReviewStatistics: builder.query<
      ReviewStatistic[],
      void
    >({
      providesTags: ['ReviewStatistic'],
      query: () =>
        qb
          .select()
          .from(reviewStatisticsTable)
          .where(lt(reviewStatisticsTable.percentage_correct, 75))
          .toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, reviewStatisticsTable),
    }),
    saveReviews: builder.mutation<void, Review[]>({
      invalidatesTags: ['Review'],
      query: reviews => upsertTable(reviewsTable, reviews),
    }),
    saveLevelProgressions: builder.mutation<void, LevelProgression[]>({
      invalidatesTags: ['LevelProgression'],
      query: levelProgressions =>
        upsertTable(levelProgressionsTable, levelProgressions),
    }),
    getLevelProgressions: builder.query<LevelProgression[], void>({
      providesTags: ['LevelProgression'],
      query: () => qb.select().from(levelProgressionsTable).toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, levelProgressionsTable),
    }),
    getRecentMistakeReviews: builder.query<Review[], void>({
      providesTags: ['Review'],
      query: () =>
        qb
          .select()
          .from(reviewsTable)
          .where(
            and(
              gte(
                reviewsTable.created_at,
                dateToUnixTimestamp(getLocalDayAgoTime()),
              ),
              or(
                gte(reviewsTable.incorrect_meaning_answers, 0),
                gte(reviewsTable.incorrect_reading_answers, 0),
              ),
            ),
          )
          .toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, reviewsTable),
    }),
    saveStudyMaterials: builder.mutation<void, StudyMaterial[]>({
      invalidatesTags: ['StudyMaterial'],
      query: materials => upsertTable(studyMaterialsTable, materials),
    }),
    getStudyMaterials: builder.query<StudyMaterial[], number[]>({
      providesTags: ['StudyMaterial'],
      query: subjectIds =>
        qb
          .select()
          .from(studyMaterialsTable)
          .where(inArray(studyMaterialsTable.subject_id, subjectIds))
          .toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, studyMaterialsTable),
    }),
  }),
})

export const {
  useGetReviewStatisticQuery,
  useGetCriticalConditionReviewStatisticsQuery,
  useGetLevelProgressionsQuery,
  useGetStudyMaterialsQuery,

  useGetRecentMistakeReviewsQuery,

  useSaveReviewStatisticsMutation,
  useSaveLevelProgressionsMutation,
  useSaveStudyMaterialsMutation,
} = localDbApi

export const upsertTable = <S extends TableConfig, T>(
  schemaTable: SQLiteTableWithColumns<S>,
  entities: T[],
): Query => {
  const table = getTableConfig(schemaTable)
  const columns = table.columns.map(e => e.name).join(', ')
  const values = table.columns.map(_ => '?').join(', ')
  const allValues = Array(entities.length).fill(`(${values})`).join(', ')
  const query = `
          INSERT OR REPLACE INTO 
        ${table.name}
        (${columns})
          VALUES
        ${allValues}
        `
  const params = entities.flatMap(entity => {
    return table.columns.map(e => {
      const key = e.name as keyof typeof entity
      return transformValue(e, entity[key])
    })
  })
  return {
    sql: query,
    params,
  }
}

const transformValue = (
  column: AnySQLiteColumn,
  value: unknown,
): SQLiteBindValue => {
  if (column.columnType === 'SQLiteTimestamp' && typeof value === 'string') {
    value = new Date(value)
  }

  // Map Date to number
  return column.mapToDriverValue(value) as SQLiteBindValue
}

export const transformDrizzleResponse = <
  S extends TableConfig,
  T,
  R extends T | T[],
>(
  rows: any[],
  table: SQLiteTableWithColumns<S>,
  expectedArray: boolean = true,
): R => {
  const columns = getTableColumns(table)
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key in columns) {
        const column = (columns as any)[key]
        ;(row as any)[key] = transformValueBack(column, (row as any)[key])
      }
    }
  }
  return expectedArray ? rows : rows[0]
}

const transformValueBack = (
  column: AnySQLiteColumn,
  value: unknown,
): unknown => {
  return column.mapFromDriverValue(value)
}
