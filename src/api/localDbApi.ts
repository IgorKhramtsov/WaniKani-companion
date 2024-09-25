import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import {
  SQLiteBindParams,
  SQLiteDatabase,
  SQLiteVariadicBindParams,
} from 'expo-sqlite'
import { Subject, SubjectType, SubjectUtils } from '../types/subject'
import { Assignment } from '../types/assignment'
import wanakana from 'wanakana'
import { ReviewStatistic } from '../types/reviewStatistic'
import { Review } from '../types/review'
import { LevelProgression } from '../types/levelProgression'

const baseQueryWithSqlite =
  (
    sqliteDb: SQLiteDatabase,
  ): BaseQueryFn<
    { query: string; params: SQLiteBindParams },
    unknown,
    unknown,
    any,
    any
  > =>
  async ({ query, params }, api, extraOptions) => {
    const statement = await sqliteDb.prepareAsync(query)
    try {
      const result = await statement.executeAsync(params)
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
  baseQuery: (
    args: { query: string; params: SQLiteVariadicBindParams },
    api,
    extraOptions,
  ) => {
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
  ],
  endpoints: builder => ({
    getSubject: builder.query<Subject | undefined, number>({
      providesTags: ['Subject'],
      query: id => ({
        query: 'SELECT data FROM subjects WHERE id = ? LIMIT 1',
        params: [id],
      }),
      transformResponse: (response: { data: string }[]) =>
        response.length ? JSON.parse(response[0].data) : undefined,
    }),
    getSubjects: builder.query<Subject[], number[]>({
      providesTags: ['Subject'],
      query: ids => ({
        query: `SELECT data FROM subjects WHERE id IN (${ids.map(() => '?').join(', ')})`,
        params: ids,
      }),
      transformResponse: (response: { data: string }[]) =>
        response.map(row => JSON.parse(row.data)),
    }),
    findSubjectsBy: builder.query<
      Subject[],
      { level?: number; type?: SubjectType; srsStage?: number }
    >({
      providesTags: ['Subject'],
      query: ({ level, type, srsStage }) => {
        let sql = 'SELECT data FROM subjects'
        const conditions: string[] = []
        const values: SQLiteVariadicBindParams = []
        if (level !== undefined) {
          conditions.push('level = ?')
          values.push(level)
        }
        if (type !== undefined) {
          conditions.push('type = ?')
          values.push(type)
        }
        if (srsStage !== undefined) {
          conditions.push('srs_stage = ?')
          values.push(srsStage)
        }
        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`
        }
        return {
          query: sql,
          params: values,
        }
      },
      transformResponse: (response: { data: string }[]) =>
        response.map(row => JSON.parse(row.data)),
    }),
    getAssignment: builder.query<Assignment | undefined, number>({
      providesTags: ['Assignment'],
      query: subject_id => ({
        query: 'SELECT data FROM assignments WHERE subject_id = ? LIMIT 1',
        params: [subject_id],
      }),
      transformResponse: (response: { data: string }[]) =>
        response.length ? JSON.parse(response[0].data) : undefined,
    }),
    findAssignmentsBy: builder.query<Assignment[], { subjectIds: number[] }>({
      providesTags: ['Assignment'],
      query: ({ subjectIds }) => {
        let sql = 'SELECT data FROM assignments'
        const conditions: string[] = []
        const values: SQLiteVariadicBindParams = []
        if (subjectIds !== undefined && subjectIds.length > 0) {
          conditions.push(`subject_id IN (${subjectIds.join(', ')})`)
        }
        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`
        }
        return {
          query: sql,
          params: values,
        }
      },
      transformResponse: (response: { data: string }[]) =>
        response.map(row => JSON.parse(row.data)),
    }),
    // TODO: optimize to get only necessary data (only review assignments,
    // aggregate only count)
    getAssignments: builder.query<Assignment[], void>({
      providesTags: ['Assignment'],
      query: () => ({
        query: 'SELECT data FROM assignments',
        params: [],
      }),
      transformResponse: (response: { data: string }[]) =>
        response.map(row => JSON.parse(row.data)),
    }),
    searchSubjects: builder.query<Subject[], string>({
      providesTags: ['Subject'],
      query: query => {
        const queryJp = wanakana.toKana(query, { IMEMode: 'toHiragana' })
        // TODO: mnemonic search should show snippet of the found entry. This might
        // result in a lot of results. We could experiment with ranking, for that
        // the sqlite's FTS might be useful(https://www.youtube.com/watch?v=eXMA_2dEMO0)
        //
        // LOWER(meaning_mnemonic) LIKE ? OR
        // LOWER(reading_mnemonic) LIKE ? OR
        // `%${query}%`,
        // `%${query}%`,
        return {
          query: `
            SELECT data FROM subjects WHERE 
            (',' || LOWER(meanings) || ',') LIKE ? OR 
            (',' || LOWER(readings) || ',') LIKE ? OR 
            characters LIKE ? 
            LIMIT 50`,
          params: [
            `%,%${query.toLowerCase()}%,%`,
            `%,%${queryJp}%,%`,
            `%${queryJp}%`,
          ],
        }
      },
      transformResponse: (response: { data: string }[]) =>
        response.map(row => JSON.parse(row.data)),
    }),
    saveSubjects: builder.mutation<void, Subject[]>({
      invalidatesTags: ['Subject'],
      query: subjects => {
        const queryDef = `INSERT OR REPLACE INTO subjects 
          (
            id,
            data,
            level,
            type,
            meanings,
            readings,
            meaning_mnemonic,
            reading_mnemonic,
            characters
          ) VALUES`
        return {
          query: getQueryFor(queryDef, subjects.length),
          params: subjects.flatMap(s => [
            s.id,
            JSON.stringify(s),
            s.level,
            s.type,
            s.meanings.map(e => e.meaning).join(','),
            SubjectUtils.hasReading(s)
              ? s.readings.map(e => e.reading).join(',')
              : null,
            s.meaning_mnemonic,
            SubjectUtils.hasReading(s) ? s.reading_mnemonic : null,
            s.characters,
          ]),
        }
      },
    }),
    saveAssignments: builder.mutation<void, Assignment[]>({
      invalidatesTags: ['Assignment'],
      query: assignments => ({
        query: [
          `INSERT OR REPLACE INTO assignments (id, data, subject_id, available_at, srs_stage) VALUES `,
          Array(assignments.length).fill('(?, ?, ?, ?, ?)').join(', '),
        ].join(' '),
        params: assignments.flatMap(e => [
          e.id,
          JSON.stringify(e),
          e.subject_id,
          dateToUnixTimestamp(e.available_at) ?? 0,
          e.srs_stage,
        ]),
      }),
    }),
    getReviewStatistic: builder.query<ReviewStatistic | undefined, number>({
      providesTags: ['ReviewStatistic'],
      query: subject_id => ({
        query:
          'SELECT data FROM review_statistics WHERE subject_id = ? LIMIT 1',
        params: [subject_id],
      }),
      transformResponse: (response: { data: string }[]) =>
        response.length ? JSON.parse(response[0].data) : undefined,
    }),
    saveReviewStatistics: builder.mutation<void, ReviewStatistic[]>({
      invalidatesTags: ['ReviewStatistic'],
      query: reviewStatistics => ({
        query: [
          `INSERT OR REPLACE INTO review_statistics (id, data, subject_id) VALUES `,
          Array(reviewStatistics.length).fill('(?, ?, ?)').join(', '),
        ].join(' '),
        params: reviewStatistics.flatMap(e => [
          e.id,
          JSON.stringify(e),
          e.subject_id,
        ]),
      }),
    }),
    saveReviews: builder.mutation<void, Review[]>({
      invalidatesTags: ['Review'],
      query: reviews => ({
        query: [
          `INSERT OR REPLACE INTO reviews (id, data, created_at, subject_id) VALUES `,
          Array(reviews.length).fill('(?, ?, ?, ?)').join(', '),
        ].join(' '),
        params: reviews.flatMap(e => [
          e.id,
          JSON.stringify(e),
          dateToUnixTimestamp(e.created_at),
          e.subject_id,
        ]),
      }),
    }),
    saveLevelProgressions: builder.mutation<void, LevelProgression[]>({
      invalidatesTags: ['LevelProgression'],
      query: levelProgressions => {
        const queryDef = `INSERT OR REPLACE INTO level_progressions
            (
              id,
              data,
              created_at,
              level,
              unlocked_at,
              started_at,
              passed_at,
              completed_at,
              abandoned_at
            ) VALUES
          `
        return {
          query: getQueryFor(queryDef, levelProgressions.length),
          params: levelProgressions.flatMap(e => [
            e.id,
            JSON.stringify(e),
            dateToUnixTimestamp(e.created_at),
            e.level,
            dateToUnixTimestamp(e.unlocked_at),
            dateToUnixTimestamp(e.started_at),
            dateToUnixTimestamp(e.passed_at),
            dateToUnixTimestamp(e.completed_at),
            dateToUnixTimestamp(e.abandoned_at),
          ]),
        }
      },
    }),
    getLevelProgressions: builder.query<LevelProgression[], void>({
      providesTags: ['LevelProgression'],
      query: () => ({
        query: 'SELECT data FROM level_progressions',
        params: [],
      }),
      transformResponse: (response: { data: string }[]) =>
        response.map(row => JSON.parse(row.data)),
    }),
  }),
})

/// Converts a date string to a unix timestamp(seconds since epoch)
const dateToUnixTimestamp = (date?: string | null) =>
  date ? Math.round(new Date(date).valueOf() / 1000) : null

const getQueryFor = (queryDef: string, valuesCount: number) => {
  // Gets number of params for query
  const numberOfParams = queryDef.match(/\([^)]*\)/)![0].split(',').length
  const values = Array(valuesCount).fill(
    `(${Array(numberOfParams).fill('?').join(', ')})`,
  )
  return [queryDef, values].join(' ')
}

export const {
  useGetSubjectQuery,
  useGetSubjectsQuery,
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useGetReviewStatisticQuery,
  useGetLevelProgressionsQuery,

  useFindSubjectsByQuery,
  useFindAssignmentsByQuery,

  useSearchSubjectsQuery,

  useSaveSubjectsMutation,
  useSaveAssignmentsMutation,
  useSaveReviewStatisticsMutation,
  useSaveLevelProgressionsMutation,
} = localDbApi
