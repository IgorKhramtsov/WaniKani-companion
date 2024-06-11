import { useAutosave } from 'react-autosave'
import {
  useGetUserQuery,
  useSetUserPreferencesMutation,
} from '../api/wanikaniApi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Preferences } from '../types/preferences'

export const useSettings = () => {
  const { data: user, isLoading } = useGetUserQuery()
  const [setPreferencesMutation] = useSetUserPreferencesMutation()
  // State is used just to aggregate changes to be saved and save them with
  // debounce
  const [preferences, setPreferences] = useState<Preferences | undefined>()
  const resolvedPreferences = useMemo(() => {
    return preferences || user?.preferences
  }, [preferences, user?.preferences])
  useAutosave({
    data: preferences,
    onSave: data => {
      console.log('trying to save preferences')
      if (!data) return
      setPreferencesMutation(data)
    },
    saveOnUnmount: true,
  })
  // Sync state with remote data (with deep equality check!)
  useEffect(() => {
    if (user?.preferences) {
      console.log('Setting preferences to undefined to use remote data')
      setPreferences(undefined)
    }
  }, [user?.preferences])

  const setProperty = useCallback(
    (key: keyof Preferences, value: any) => {
      if (!resolvedPreferences) return
      setPreferences({ ...resolvedPreferences, [key]: value })
    },
    [resolvedPreferences, setPreferences],
  )

  return { preferences: resolvedPreferences, setProperty, isLoading }
}
