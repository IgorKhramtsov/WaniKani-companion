import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Subject, SubjectUtils } from '../types/subject'
import { RootState } from './store'
import { EnrichedSubject } from '../utils/answerChecker/types/enrichedSubject'
import { Vocabulary } from '../types/vocabulary'
import { Kanji } from '../types/kanji'
import { Radical } from '../types/radical'
import { StudyMaterial } from '../types/studyMaterial'

export interface SubjectsSlice {
  subjects: Record<number, Subject>
  studyMaterials: Record<number, StudyMaterial>
}

const initialState: SubjectsSlice = {
  subjects: {},
  studyMaterials: {},
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
    },
    studyMaterialsReceived(state, action: PayloadAction<StudyMaterial[]>) {
      state.studyMaterials = action.payload.reduce(
        (acc, studyMaterial) => ({
          ...acc,
          [studyMaterial.subject_id]: studyMaterial,
        }),
        state.studyMaterials,
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
  (state: RootState) => state.subjectsSlice.studyMaterials,
  (_: RootState, ids: number[]) => ids,
  (allSubjects, allStudyMaterials, ids): EnrichedSubject[] => {
    const subjects = ids
      .map(id => allSubjects[id])
      .filter((e): e is Subject => e !== undefined)
    const enrichedSubjects: EnrichedSubject[] = []
    for (const subject of subjects) {
      const studyMaterial = allStudyMaterials[subject.id]
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
        studyMaterial,
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

export const { subjectsReceived, studyMaterialsReceived } =
  subjectsSlice.actions

export default subjectsSlice.reducer
