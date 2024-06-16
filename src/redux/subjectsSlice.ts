import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { Subject } from '../types/subject'
import { RootState } from './store'

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

export const { subjectsReceived } = subjectsSlice.actions

export default subjectsSlice.reducer
