import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import {
  SQLiteBindParams,
  SQLiteDatabase,
  SQLiteVariadicBindParams,
} from 'expo-sqlite'
import { Subject, SubjectUtils } from '../types/subject'
import { Assignment } from '../types/assignment'
import wanakana from 'wanakana'
import { ReviewStatistic } from '../types/reviewStatistic'
import { Review } from '../types/review'

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
  tagTypes: ['Subject', 'Assignment', 'ReviewStatistic', 'Review'],
  endpoints: builder => ({
    getSubject: builder.query<Subject | undefined, number>({
      providesTags: ['Subject'],
      query: id => ({
        query: 'SELECT data FROM subjects WHERE id = ? LIMIT 1',
        params: [id],
      }),
      transformResponse: (response: { data: string }[]) => {
        return response.length ? JSON.parse(response[0].data) : undefined
      },
    }),
    getSubjects: builder.query<Subject[], number[]>({
      providesTags: ['Subject'],
      query: ids => ({
        query: `SELECT data FROM subjects WHERE id IN (${ids.map(() => '?').join(', ')})`,
        params: ids,
      }),
      transformResponse: (response: { data: string }[]) => {
        return response.map(row => JSON.parse(row.data))
      },
    }),
    getAssignment: builder.query<Assignment | undefined, number>({
      providesTags: ['Assignment'],
      query: subject_id => ({
        query: 'SELECT data FROM assignments WHERE subject_id = ? LIMIT 1',
        params: [subject_id],
      }),
      transformResponse: (response: { data: string }[]) => {
        console.log('getAssignment:', response)
        return response.length ? JSON.parse(response[0].data) : undefined
      },
    }),
    // TODO: optimize to get only neccesasry data (only review assignments,
    // aggregate only count)
    getAssignments: builder.query<Assignment[], void>({
      providesTags: ['Assignment'],
      query: () => ({
        query: 'SELECT data FROM assignments',
        params: [],
      }),
      transformResponse: (response: { data: string }[]) => {
        return response.map(row => JSON.parse(row.data))
      },
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
      transformResponse: (response: { data: string }[]) => {
        return response.map(row => JSON.parse(row.data))
      },
    }),
    saveSubject: builder.mutation<void, Subject>({
      invalidatesTags: ['Subject'],
      query: subject => ({
        query: `INSERT OR REPLACE INTO subjects (id, data) VALUES (?, ?)`,
        params: [subject.id, JSON.stringify(subject)],
      }),
    }),
    saveSubjects: builder.mutation<void, Subject[]>({
      invalidatesTags: ['Subject'],
      query: subjects => ({
        query: [
          `INSERT OR REPLACE INTO subjects (id, data, meanings, readings, meaning_mnemonic, reading_mnemonic, characters) VALUES`,
          Array(subjects.length).fill('(?, ?, ?, ?, ?, ?, ?)').join(', '),
        ].join(' '),
        params: subjects.flatMap(s => [
          s.id,
          JSON.stringify(s),
          s.meanings.map(e => e.meaning).join(','),
          SubjectUtils.hasReading(s)
            ? s.readings.map(e => e.reading).join(',')
            : null,
          s.meaning_mnemonic,
          SubjectUtils.hasReading(s) ? s.reading_mnemonic : null,
          s.characters,
        ]),
      }),
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
          // Seconds since epoch
          !!e.available_at ? new Date(e.available_at).valueOf() / 1000 : 0,
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
      transformResponse: (response: { data: string }[]) => {
        return response.length ? JSON.parse(response[0].data) : undefined
      },
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
    saveReview: builder.mutation<void, Review[]>({
      invalidatesTags: ['Review'],
      query: review => ({
        query: [
          `INSERT OR REPLACE INTO reviews (id, data, created_at, subject_id) VALUES `,
          Array(review.length).fill('(?, ?, ?, ?)').join(', '),
        ].join(' '),
        params: review.flatMap(e => [
          e.id,
          JSON.stringify(e),
          Math.round(new Date(e.created_at).valueOf() / 1000),
          e.subject_id,
        ]),
      }),
    }),
  }),
})

export const {
  useGetSubjectQuery,
  useGetSubjectsQuery,
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useGetReviewStatisticQuery,

  useSearchSubjectsQuery,

  useSaveSubjectMutation,
  useSaveSubjectsMutation,
  useSaveAssignmentsMutation,
  useSaveReviewStatisticsMutation,
} = localDbApi
