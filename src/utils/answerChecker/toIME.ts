import { toRomaji } from 'wanakana'

const smallKanaSuffix = ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ']
const smallKanaPrefix = ['っ', 'ッ']

const classifyKana = (inputString: string, index: number) => {
  const hasPrefix = smallKanaPrefix.includes(inputString[index])
  const hasSuffix = smallKanaSuffix.includes(inputString[index + 1])

  return {
    hasSmallKana: hasPrefix || hasSuffix,
    isSurrounded: hasPrefix && smallKanaSuffix.includes(inputString[index + 2]),
  }
}

const splitIntoMorae = (input: string) => {
  const arr = []
  for (let i = 0; i < input.length; i += 1) {
    const { hasSmallKana, isSurrounded } = classifyKana(input, i)
    if (isSurrounded) {
      arr.push(input[i] + input[i + 1] + input[i + 2])
      i += 2
    } else {
      if (hasSmallKana) {
        arr.push(input[i] + input[i + 1])
        i += 1
      } else {
        arr.push(input[i])
      }
    }
  }
  return arr
}

export const toIME = (input: string) => {
  return splitIntoMorae(input)
    .map(e => (e === 'ん' || e === 'ン' ? 'nn' : e))
    .map(e => (e === 'ー' ? '-' : e))
    .map(e => toRomaji(e))
    .join('')
}
