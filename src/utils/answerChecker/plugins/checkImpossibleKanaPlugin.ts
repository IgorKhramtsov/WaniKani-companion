// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_impossible_kana-f90891aba244f73c311d8cfc061d7fb4738cb9663b2fbc5760d2491828b4482f.js

import { CheckAnswerPlugin } from '../checkAnswerPlugin'

const containsImposssibleKana = (response: string) => {
  return (
    containsInvalidStartingCharacter(response) ||
    containsInvalidAdjacentCharacters(response) ||
    containsInvalidSmallTSU(response) ||
    containsInvalidSmallYaYuYo(response)
  )
}
const containsInvalidSmallYaYuYo = (response: string) => {
  return (
    response.search(
      /[^きしちにひみりぎじぢびぴキシチニヒミリギジヂビピ][ゃゅょャュョ]/,
    ) !== -1
  )
}
const containsInvalidSmallTSU = (response: string) => {
  return (
    response.search(
      /[っッ][あいうえおゃゅょぁぃぅぇぉアイウエオャュョァィゥェォ]/,
    ) !== -1
  )
}
const containsInvalidAdjacentCharacters = (response: string) => {
  return (
    response.search(/(んん|ンン)/) !== -1 ||
    /[んゃゅょぁぃぅぇぉンャュョァィゥェォ][ゃゅょぁぃぅぇぉャュョァィゥェォ]/.test(
      response,
    )
  )
}

const containsInvalidStartingCharacter = (response: string) => {
  return /^[んゃゅょぁぃぅぇぉっゎンャュョァィゥェォヵヶッヮ]/.test(response)
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ taskType, checkResult }) => {
    return !checkResult.passed && taskType === 'reading'
  },
  evaluate: ({ response }) => {
    if (containsImposssibleKana(response)) {
      return {
        status: 'hint',
        message: 'That looks like a typo. Do you want to retry?',
      }
    }
  },
}

export default plugin
