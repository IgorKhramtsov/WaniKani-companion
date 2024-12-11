import { Subject, SubjectType } from '@/src/types/subject'
import { localDbApi, transformDrizzleResponse, upsertTable } from './api'
import { subjectsTable } from '@/src/db/schema'
import { SQL, and, eq, or, inArray, sql, like, Column } from 'drizzle-orm'
import { QueryBuilder } from 'drizzle-orm/sqlite-core'
import wanakana from 'wanakana'
import { EnrichedSubject } from '@/src/utils/answerChecker/types/enrichedSubject'
import { filterNotUndefined } from '@/src/utils/arrayUtils'
import { Radical } from '@/src/types/radical'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'

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
    getEnrichedSubject: builder.query<EnrichedSubject | undefined, number>({
      providesTags: ['Subject'],
      query: id => {
        const subjectSq = qb
          .$with('subject')
          .as(qb.select().from(table).where(eq(table.id, id)))
        const amalgamatedIdsSq = qb.$with('amalgamated_ids').as(
          qb
            .select({ id: sql<number>`json_each.value`.as('id') })
            .from(table)
            .fullJoin(sql`json_each(amalgamation_subject_ids)`, sql`true`),
        )
        const componentIdsSq = qb.$with('component_ids').as(
          qb
            .select({ id: sql<number>`json_each.value`.as('id') })
            .from(table)
            .fullJoin(sql`json_each(component_subject_ids)`, sql`true`),
        )
        // TODO: can be reduced to just searching for subjects with eq
        // characters. Add index for that.
        return qb
          .with(subjectSq, amalgamatedIdsSq, componentIdsSq)
          .select()
          .from(table)
          .where(
            and(
              or(
                eq(table.id, qb.select({ id: subjectSq.id }).from(subjectSq)),
                inArray(
                  table.id,
                  qb.select({ id: amalgamatedIdsSq.id }).from(amalgamatedIdsSq),
                ),
                inArray(
                  table.id,
                  qb.select({ id: componentIdsSq.id }).from(componentIdsSq),
                ),
              ),
              eq(
                table.characters,
                qb.select({ characters: subjectSq.characters }).from(subjectSq),
              ),
            ),
          )
          .toSQL()
      },
      transformResponse: (rows: any[], _, arg) => {
        const subjects: Subject[] = transformDrizzleResponse(rows, table)
        const subject = subjects.find(e => e.id === arg)
        if (!subject) {
          console.log('subject not found', arg)
          return undefined
        }
        const filter = (subjects: Subject[], type: SubjectType) => {
          return filterNotUndefined(
            subjects.filter(e => e.id !== arg && e.type === type),
          )
        }

        return {
          subject: subject,
          radicals: filter(subjects, 'radical') as Radical[],
          kanji: filter(subjects, 'kanji') as Kanji[],
          vocabulary: filter(subjects, 'vocabulary') as Vocabulary[],
        }
      },
    }),
    getSubjects: builder.query<Subject[], number[]>({
      providesTags: ['Subject'],
      query: ids =>
        qb.select().from(table).where(inArray(table.id, ids)).toSQL(),
      transformResponse: (rows: any[]) => transformDrizzleResponse(rows, table),
    }),
    findSubjectsBy: builder.query<
      Subject[],
      { levels?: number[]; type?: SubjectType }
    >({
      providesTags: ['Subject'],
      query: ({ levels, type }) => {
        let sql: SQL[] = []
        if (levels !== undefined) {
          sql.push(inArray(table.level, levels))
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
  useGetEnrichedSubjectQuery,

  useFindSubjectsByQuery,

  useSearchSubjectsQuery,

  useSaveSubjectsMutation,
} = localDbSubjectsApi
