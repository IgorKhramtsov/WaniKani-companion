import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Subject, SubjectUtils } from '../types/subject'
import { RootState } from './store'
import { EnrichedSubject } from '../utils/answerChecker/types/enrichedSubject'
import { Vocabulary } from '../types/vocabulary'
import { Kanji } from '../types/kanji'
import { Radical } from '../types/radical'

export interface SubjectsSlice {
  subjects: Record<number, Subject>
}

const initialState: SubjectsSlice = {
  subjects: {},
}

export const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    subjectsReceived(state, action: PayloadAction<Subject[]>) {
      state.subjects = action.payload.reduce(
        (acc, subject) => ({ ...acc, [subject.id]: subject }),
        state.subjects,
      )
      console.log(
        '[subjectsSlice] subjects length after subjectsReceived:',
        Object.keys(state.subjects).length,
      )
    },
  },
})

const selectAllSubjects = (state: RootState) => state.subjectsSlice.subjects

const selectSubjectInner = createSelector(
  selectAllSubjects,
  (_: RootState, ids: number[]) => ids,
  (subjects, ids) =>
    ids.map(id => subjects[id]).filter((e): e is Subject => e !== undefined),
)
export const selectSubjects = (ids: number[]) => (state: RootState) =>
  selectSubjectInner(state, ids)

const selectEnrichedSubjectsInner = createSelector(
  selectAllSubjects,
  (_: RootState, ids: number[]) => ids,
  (allSubjects, ids): EnrichedSubject[] => {
    const subjects = ids
      .map(id => allSubjects[id])
      .filter((e): e is Subject => e !== undefined)
    const enrichedSubjects: EnrichedSubject[] = []
    for (const subject of subjects) {
      const radicals: Radical[] = []
      const kanji: Kanji[] = []
      const vocabulary: Vocabulary[] = []
      if (SubjectUtils.isRadical(subject)) {
        const amalgamationSubjects = subject.amalgamation_subject_ids
          .map(id => allSubjects[id])
          .filter((el): el is Subject => el !== undefined)
          .filter((el): el is Kanji => SubjectUtils.isKanji(el))
          .filter(el => el.characters === subject.characters)
        kanji.push(...amalgamationSubjects)
      } else if (SubjectUtils.isKanji(subject)) {
        const compositionSubjects = subject.component_subject_ids
          .map(id => allSubjects[id])
          .filter((el): el is Subject => el !== undefined)
          .filter((el): el is Radical => SubjectUtils.isRadical(el))
          .filter(el => el.characters === subject.characters)
        const amalgamationSubjects = subject.amalgamation_subject_ids
          .map(id => allSubjects[id])
          .filter((el): el is Subject => el !== undefined)
          .filter((el): el is Vocabulary => SubjectUtils.isVocabulary(el))
          .filter(el => el.characters === subject.characters)
        radicals.push(...compositionSubjects)
        vocabulary.push(...amalgamationSubjects)
      } else if (SubjectUtils.isVocabulary(subject)) {
        const compositionSubjects = subject.component_subject_ids
          .map(id => allSubjects[id])
          .filter((el): el is Subject => el !== undefined)
          .filter((el): el is Kanji => SubjectUtils.isKanji(el))
          .filter(el => el.characters === subject.characters)
        kanji.push(...compositionSubjects)
      }
      enrichedSubjects.push({
        subject,
        radicals,
        kanji,
        vocabulary,
      })
    }

    return enrichedSubjects
  },
)
export const selectEnrichedSubjects = (ids: number[]) => (state: RootState) =>
  selectEnrichedSubjectsInner(state, ids)

export const { subjectsReceived } = subjectsSlice.actions

export default subjectsSlice.reducer
