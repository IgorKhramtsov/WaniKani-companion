import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Preferences } from '../types/preferences'
import { RootState } from './store'

export interface SettingsSlice {
  preferences?: Preferences
}

const initialState: SettingsSlice = {}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    init(state, action: PayloadAction<Preferences>) {
      state.preferences = action.payload
    },
  },
})

export const selectPreferences = (state: RootState) =>
  state.settingsSlice.preferences

export default settingsSlice.reducer
