const digitToWordMap: { [key: number]: string } = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
}

export namespace StringUtils {
  export const digitToWord = (digit: number): string => {
    return digitToWordMap[digit] || 'unknown'
  }
  export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  export type ComparingResult = 'equal' | 'almost' | 'not'

  export const compareStringWithArrayWithThreshold = (
    a: string,
    arr: string[],
    threshold: number = 1,
  ): ComparingResult => {
    const aLower = a.toLowerCase()
    const arrLower = arr.map(el => el.toLowerCase())
    if (arrLower.includes(aLower)) return 'equal'
    return arrLower.some(el =>
      optimizedLevenshteinDistance(aLower, el, threshold),
    )
      ? 'almost'
      : 'not'
  }
  export const optimizedLevenshteinDistance = (
    a: string,
    b: string,
    threshold: number = 1,
  ): boolean => {
    console.log('a: ', a, 'b: ', b, 'threshold: ', threshold)
    if (a === b) {
      console.log('exact match')
      return true // Early exit for exact match
    }

    if (Math.abs(a.length - b.length) > threshold) {
      console.log('legnth difference exceeds threshold')
      return false // Early exit if length difference exceeds threshold
    }

    if (a.length > b.length) [a, b] = [b, a] // Ensure `a` is the shorter string

    let previousRow = new Array(a.length + 1).fill(0).map((_, i) => i)
    let currentRow = new Array(a.length + 1).fill(0)

    for (let i = 1; i <= b.length; i++) {
      currentRow[0] = i
      let min = currentRow[0]

      for (let j = 1; j <= a.length; j++) {
        const insertCost = currentRow[j - 1] + 1
        const deleteCost = previousRow[j] + 1
        const replaceCost = previousRow[j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
        currentRow[j] = Math.min(insertCost, deleteCost, replaceCost)

        if (currentRow[j] < min) {
          min = currentRow[j]
        }
      }

      if (min > threshold) {
        console.log('minimum cost in the row exceeds threshold')
        return false // Early exit if the minimum cost in the row exceeds the threshold
      }

      ;[previousRow, currentRow] = [currentRow, previousRow] // Swap rows
    }

    console.log('minimum cost in the last row: ', previousRow[a.length])
    return previousRow[a.length] <= threshold
  }
}
