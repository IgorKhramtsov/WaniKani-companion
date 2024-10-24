import AsyncStorage from '@react-native-async-storage/async-storage'

const lastUpdateKey = 'lastUpdate'
const apiKeyVerificationResultKey = 'apiKeyVerificationResult'

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

const getApiKeyVerificationResult = async <T>() => {
  try {
    const val = await AsyncStorage.getItem(apiKeyVerificationResultKey)
    if (val) {
      return JSON.parse(val) as T
    }
    return undefined
  } catch (e) {
    console.error('Failed to get api key verification result. ', e)
  }
}

const setApiKeyVerificationResult = async (result: object) => {
  try {
    await AsyncStorage.setItem(
      apiKeyVerificationResultKey,
      JSON.stringify(result),
    )
  } catch (e) {
    console.error('Failed to set api key verification result.', e)
  }
}

const clearApiKeyVerificationResult = async () => {
  try {
    await AsyncStorage.removeItem(apiKeyVerificationResultKey)
  } catch (e) {
    console.error('Failed to clear api key verification result.', e)
  }
}

const clearAll = async () => {
  try {
    await AsyncStorage.clear()
  } catch (e) {
    console.error('Failed to clear all async storage.', e)
  }
}

export const asyncStorageHelper = {
  clearAll,

  getLastUpdateTime,
  setLastUpdateTime,
  clearLastUpdateTime,

  getApiKeyVerificationResult,
  setApiKeyVerificationResult,
  clearApiKeyVerificationResult,
}
