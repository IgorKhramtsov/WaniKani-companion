import AsyncStorage from '@react-native-async-storage/async-storage'

const subjectsLastUpdateAsyncStorageKey = 'subjectsLastUpdate'

const getSubjectsLastUpdate = async () => {
  try {
    const val = await AsyncStorage.getItem(subjectsLastUpdateAsyncStorageKey)
    if (val) {
      return val
    }
    return undefined
  } catch (e) {
    console.error('Failed to get subjects last update. ', e)
  }
}

const setSubjectsLastUpdate = async (lastUpdate: string) => {
  try {
    await AsyncStorage.setItem(subjectsLastUpdateAsyncStorageKey, lastUpdate)
  } catch (e) {
    console.error('Failed to set subjects last update. ', e)
  }
}

const clearSubjectsLastUpdate = async () => {
  try {
    await AsyncStorage.removeItem(subjectsLastUpdateAsyncStorageKey)
  } catch (e) {
    console.error('Failed to clear subjects last update. ', e)
  }
}

export const asyncStorageHelper = {
  getSubjectsLastUpdate,
  setSubjectsLastUpdate,
  clearSubjectsLastUpdate,
}
