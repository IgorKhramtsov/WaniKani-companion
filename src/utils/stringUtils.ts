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
}
