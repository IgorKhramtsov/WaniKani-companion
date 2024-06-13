import { useAutosave } from 'react-autosave'
import {
  useGetUserQuery,
  useSetUserPreferencesMutation,
} from '../api/wanikaniApi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Preferences } from '../types/preferences'
import { LocalSettings } from '../types/localSettings'
import {
  useGetSettingsQuery,
  useSetSettingsMutation,
} from '../api/localStorageApi'

export const useSettings = () => {
  const { data: user, isLoading: isRemoteLoading } = useGetUserQuery()
  const [setRemotePreferences] = useSetUserPreferencesMutation()
  const [setLocalSettings] = useSetSettingsMutation()
  const { data: localSettings, isLoading: isLocalLoading } =
    useGetSettingsQuery()
  // State is used just to aggregate changes to be saved and save them with
  // debounce
  const [remotePreferencesState, setRemotePreferencesState] = useState<
    Preferences | undefined
  >()
  const [localSettingsState, setLocalSettingsState] = useState<
    LocalSettings | undefined
  >()
  const resolvedRemotePreferences = useMemo(() => {
    return remotePreferencesState || user?.preferences
  }, [remotePreferencesState, user?.preferences])
  const resolvedLocalSettings = useMemo(() => {
    return localSettingsState || localSettings
  }, [localSettingsState, localSettings])
  const resolvedIsLoading = useMemo(() => {
    return isRemoteLoading || isLocalLoading
  }, [isRemoteLoading, isLocalLoading])
  useAutosave({
    data: remotePreferencesState,
    onSave: data => {
      console.log('trying to save preferences')
      if (!data) return
      setRemotePreferences(data)
    },
    saveOnUnmount: true,
  })
  useAutosave({
    data: localSettingsState,
    onSave: data => {
      console.log('trying to save local settings')
      if (!data) return
      setLocalSettings(data)
    },
    saveOnUnmount: true,
  })
  // Sync state with remote data
  useEffect(() => {
    if (user?.preferences) {
      console.log('Setting preferences state to undefined to use remote data')
      setRemotePreferencesState(undefined)
    }
  }, [user?.preferences])
  // Sync state with remote data
  useEffect(() => {
    if (localSettings) {
      console.log(
        'Setting local settings state to undefined to use data from async storage',
      )
      setLocalSettingsState(undefined)
    }
  }, [localSettings])

  const setProperty = useCallback(
    (key: keyof LocalSettings | keyof Preferences, value: any) => {
      if (!resolvedLocalSettings) return
      if (!resolvedRemotePreferences) return

      if (key in resolvedLocalSettings) {
        setLocalSettingsState({ ...resolvedLocalSettings, [key]: value })
      } else if (key in resolvedRemotePreferences) {
        setRemotePreferencesState({
          ...resolvedRemotePreferences,
          [key]: value,
        })
      }
    },
    [
      resolvedLocalSettings,
      resolvedRemotePreferences,
      setLocalSettingsState,
      setRemotePreferencesState,
    ],
  )

  return {
    settings: { ...resolvedLocalSettings, ...resolvedRemotePreferences },
    setProperty,
    isLoading: resolvedIsLoading,
  }
}
