export function filterNotUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== undefined)
}

/*
 * Compares two arrays for shallow equality (Same elements in the same order)
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false
  return arr1.every((element, index) => element === arr2[index])
}
