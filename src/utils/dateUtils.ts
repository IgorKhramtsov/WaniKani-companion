export const getLocalStartOfDayInUTC = (): string => {
  const now = new Date()
  // Set the date to local midnight
  const localMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  // Convert local midnight to UTC
  return localMidnight.toISOString().split('.')[0] + 'Z'
}

export const isToday = (date: string | undefined | null): boolean => {
  if (!date) return false

  const createdDate = new Date(date)
  const localMidnight = new Date(getLocalStartOfDayInUTC())

  return createdDate >= localMidnight
}
