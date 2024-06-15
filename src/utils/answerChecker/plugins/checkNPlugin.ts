// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_n-f0ff10e07aa6daf079b93100b9f5171fe617b2c8a7ae02d0fbebdf8f4c8def52.js

import { SubjectUtils } from '@/src/types/subject'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { toIME } from '../toIME'
import { toRomaji } from 'wanakana'

const customRomajiMapping = {
  ぢ: 'di',
  づ: 'du',
  ぢゃ: 'dya',
  ぢゅ: 'dyu',
  ぢょ: 'dyo',
  ふ: 'hu',
}
const toRomajiCustom = (n: string) => toRomaji(n, { customRomajiMapping })

const toRomajiMora = (n: string) =>
  n.split('').map(n => ('っ' === n ? '*' : toRomajiCustom(n)))

const identicalArrays = <T>(n: T[], t: T[]) =>
  n.length === t.length && n.every((n, e) => n === t[e])

const cloneAndSplice = <T>(n: T[], t: number, e: number, ...i: T[]) => {
  const a = n.slice()
  a.splice(t, e, ...i)
  return a
}

const createMissingNPermutations = (
  matrix: string[][],
  iteration: number = 0,
) => {
  const lastRow = matrix[matrix.length - 1] // Row or col?
  const pushAndProcess = (row: string[], i: number = 0) => {
    matrix.push(row)
    createMissingNPermutations(matrix, i)
  }
  lastRow.forEach((e, i) => {
    if (!e.startsWith('n') || i < iteration) return

    const next = lastRow[i + 1]
    if (e === 'n') {
      if (next && /^[aeiou]$/.test(next)) {
        pushAndProcess(cloneAndSplice(lastRow, i + 1, 1, `n${next}`))
      }
      if (next && /^(ya|yu|yo)$/.test(next)) {
        pushAndProcess(cloneAndSplice(lastRow, i + 1, 0, 'ni'))
      }
    }
    if (/^n[aeiou]$/.test(e) && i > 0 && 'n' !== lastRow[i - 1]) {
      const t = cloneAndSplice(lastRow, i, 1, 'n', e.charAt(1))
      pushAndProcess(t, i + 1)

      if (e === 'ni' && next && /^(ya|yu|yo)$/.test(next)) {
        pushAndProcess(cloneAndSplice(lastRow, i, 1, 'n'), i + 1)
      }
    }
  })

  return matrix
}
const createTooManyNPermutations = (matrix: string[][], iteration = 0) => {
  const lastRow = matrix[matrix.length - 1]
  const pushAndProcess = (row: string[], i: number = 0) => {
    matrix.push(row)
    createTooManyNPermutations(matrix, i)
  }
  lastRow.forEach((e, i) => {
    if ('n' !== e || i < iteration) return

    const next = lastRow[i + 1]
    if (next && /^n[aeou]$/.test(next)) {
      pushAndProcess(cloneAndSplice(lastRow, i + 1, 1, next.charAt(1)), i + 1)
    }
    if (next === 'ni') {
      const nextNext = lastRow[i + 2]
      if (/^(ya|yu|yo)$/.test(nextNext)) {
        pushAndProcess(cloneAndSplice(lastRow, i + 1, 1), i + 1)
      } else {
        pushAndProcess(cloneAndSplice(lastRow, i + 1, 1, next.charAt(1)), i + 1)
      }
    }
  })
  return matrix
}

const findMatchingIndexInArrayOfArrays = <T>(matrixA: T[][], matrixB: T[][]) =>
  matrixA.findIndex(a => matrixB.some(b => identicalArrays(a, b)))

const getReadingsContainingN = (readings: string[]) => {
  return readings.filter(e => e.includes('ん'))
}

const findIndexOfReadingWithTooFewNs = (
  response: string,
  readingsContainingN: string[],
) => {
  return findIndexOfReadingMatchingPermutations(
    createMissingNPermutations,
    response,
    readingsContainingN,
  )
}

const findIndexOfReadingWithTooManyNs = (
  response: string,
  readingsContainingN: string[],
) => {
  return findIndexOfReadingMatchingPermutations(
    createTooManyNPermutations,
    response,
    readingsContainingN,
  )
}

const findIndexOfReadingMatchingPermutations = (
  func: (matrix: string[][], t?: number) => string[][],
  response: string,
  readingsContainingN: string[],
) => {
  const permutations = func([toRomajiMora(response)])
  return findMatchingIndexInArrayOfArrays(
    readingsContainingN.map(toRomajiMora),
    permutations,
  )
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ taskType, subject }) => {
    return (
      taskType === 'reading' &&
      (SubjectUtils.isKanji(subject.subject) ||
        SubjectUtils.isVocabulary(subject.subject))
    )
  },
  evaluate: ({ response, subject: enrichedSubject }) => {
    const { subject } = enrichedSubject
    if (!SubjectUtils.isKanji(subject) && !SubjectUtils.isVocabulary(subject)) {
      return undefined
    }

    const readingsContainingN = getReadingsContainingN(
      subject.readings.map(e => e.reading),
    )
    if (readingsContainingN.length > 0) {
      const n = findIndexOfReadingWithTooFewNs(response, readingsContainingN)
      if (n !== -1) {
        const reading = readingsContainingN[n]
        return {
          status: 'hint',
          message: `Don’t forget that ん is typed as “nn”. Try typing “${toIME(reading)}”.`,
        }
      }
      if (
        findIndexOfReadingWithTooManyNs(response, readingsContainingN) !== -1
      ) {
        return {
          status: 'hint',
          message: 'That looks like a typo. Watch out for those "n"s.',
        }
      }
    }
  },
}

export default plugin
