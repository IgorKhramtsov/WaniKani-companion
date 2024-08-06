import AsyncStorage from '@react-native-async-storage/async-storage'

const lastUpdateKey = 'lastUpdate'

const getLastUpdateTime = async () => {
  try {
    const val = await AsyncStorage.getItem(lastUpdateKey)
    if (val) {
      return val
    }
    return undefined
  } catch (e) {
    console.error('Failed to get last update. ', e)
  }
}

const setLastUpdateTime = async (lastUpdate: string) => {
  try {
    await AsyncStorage.setItem(lastUpdateKey, lastUpdate)
  } catch (e) {
    console.error('Failed to set last update. ', e)
  }
}

const clearLastUpdateTime = async () => {
  try {
    await AsyncStorage.removeItem(lastUpdateKey)
  } catch (e) {
    console.error('Failed to clear last update. ', e)
  }
}

export const asyncStorageHelper = {
  getLastUpdateTime,
  setLastUpdateTime,
  clearLastUpdateTime,
}
