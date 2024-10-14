import { Subject, SubjectType } from '@/src/types/subject'
import { localDbApi, transformDrizzleResponse, upsertTable } from './api'
import { subjectsTable } from '@/src/db/schema'
import { SQL, and, eq, or, inArray, sql, like, Column } from 'drizzle-orm'
import { QueryBuilder } from 'drizzle-orm/sqlite-core'
import wanakana from 'wanakana'

const qb = new QueryBuilder()
const table = subjectsTable

export const localDbSubjectsApi = localDbApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getSubject: builder.query<Subject | undefined, number>({
      providesTags: ['Subject'],
      query: id => qb.select().from(table).where(eq(table.id, id)).toSQL(),
      transformResponse: (rows: any[]) =>
        transformDrizzleResponse(rows, table, false),
    }),
    getSubjects: builder.query<Subject[], number[]>({
      providesTags: ['Subject'],
      query: ids =>
        qb.select().from(table).where(inArray(table.id, ids)).toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    findSubjectsBy: builder.query<
      Subject[],
      { level?: number; type?: SubjectType }
    >({
      providesTags: ['Subject'],
      query: ({ level, type }) => {
        let sql: SQL[] = []
        if (level !== undefined) {
          sql.push(eq(table.level, level))
        }
        if (type !== undefined) {
          sql.push(eq(table.type, type))
        }
        return qb
          .select()
          .from(table)
          .where(and(...sql))
          .toSQL()
      },
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    searchSubjects: builder.query<Subject[], string>({
      providesTags: ['Subject'],
      query: query => {
        const queryJp = wanakana.toKana(query, { IMEMode: 'toHiragana' })
        function likeInArray(column: Column, value: string) {
          value = `%,${value},%`
          return sql`(',' || LOWER(${column}) || ',') LIKE ${value}`
        }
        // TODO: mnemonic search should show snippet of the found entry. This might
        // result in a lot of results. We could experiment with ranking, for that
        // the sqlite's FTS might be useful(https://www.youtube.com/watch?v=eXMA_2dEMO0)
        //
        // LOWER(meaning_mnemonic) LIKE ? OR
        // LOWER(reading_mnemonic) LIKE ? OR
        // `%${query}%`,
        // `%${query}%`,
        return qb
          .select()
          .from(table)
          .where(
            or(
              likeInArray(table.meanings, `%${query.toLowerCase()}%`),
              likeInArray(table.readings, `%${queryJp}%`),
              like(table.characters, `%${queryJp}%`),
            ),
          )
          .limit(50)
          .toSQL()
      },
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    saveSubjects: builder.mutation<void, Subject[]>({
      invalidatesTags: ['Subject'],
      query: subjects => upsertTable(table, subjects),
    }),
  }),
})

export const {
  useGetSubjectQuery,
  useGetSubjectsQuery,

  useFindSubjectsByQuery,

  useSearchSubjectsQuery,

  useSaveSubjectsMutation,
} = localDbSubjectsApi
