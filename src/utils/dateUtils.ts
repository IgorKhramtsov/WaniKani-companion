export const getLocalDayStart = (): Date => {
  const now = new Date()
  // Set the date to local midnight
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export const getLocalStartOfDayInUTCString = (): string => {
  const localMidnight = getLocalDayStart()
  // Convert local midnight to UTC
  return localMidnight.toISOString().split('.')[0] + 'Z'
}

export const isToday = (date: number | undefined | null): boolean => {
  if (!date) return false

  const createdDate = new Date(date)
  const localMidnight = getLocalDayStart()

  return createdDate >= localMidnight
}

export const dateToUnixTimestamp = (date: Date): number =>
  Math.round(date.valueOf() / 1000)
