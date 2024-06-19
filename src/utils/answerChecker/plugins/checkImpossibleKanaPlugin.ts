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

/**
 * Checks if the given response contains invalid sequences where a small ゃ, ゅ, or ょ (or their katakana equivalents)
 * is preceded by an invalid character.
 *
 * In Japanese, small ゃ, ゅ, or ょ should only follow certain consonants such as き, し, ち, に, ひ, み, り, ぎ, じ, ぢ, び, ぴ
 * (and their katakana equivalents: キ, シ, チ, ニ, ヒ, ミ, リ, ギ, ジ, ヂ, ビ, ピ). This function identifies cases
 * where a small ゃ, ゅ, or ょ follows an invalid character.
 *
 * @param {string} response - The string to check for invalid small ゃ, ゅ, or ょ sequences.
 * @returns {boolean} - Returns true if an invalid sequence is found; otherwise, false.
 *
 * @example
 * // Returns true because 'あゃ' is invalid
 * containsInvalidSmallYaYuYo('あゃ');
 *
 * @example
 * // Returns false because 'きゃ' is valid
 * containsInvalidSmallYaYuYo('きゃ');
 */
const containsInvalidSmallYaYuYo = (response: string): boolean => {
  return (
    response.search(
      /[^きしちにひみりぎじぢびぴキシチニヒミリギジヂビピ][ゃゅょャュョ]/,
    ) !== -1
  )
}

/**
 * Checks if the given response contains invalid sequences where a small っ or ッ is followed by an invalid character.
 *
 * In Japanese, small っ or ッ (sokuon) is used to indicate a geminate consonant (double consonant) and should not
 * be followed by vowels or certain kana. This function identifies cases where a small っ or ッ is followed
 * by an invalid character such as a vowel or small kana.
 *
 * @param {string} response - The string to check for invalid small っ or ッ sequences.
 * @returns {boolean} - Returns true if an invalid sequence is found; otherwise, false.
 *
 * @example
 * // Returns true because 'っあ' is invalid
 * containsInvalidSmallTSU('っあ');
 *
 * @example
 * // Returns false because 'って' is valid
 * containsInvalidSmallTSU('って');
 */
const containsInvalidSmallTSU = (response: string): boolean => {
  return (
    response.search(
      /[っッ][あいうえおゃゅょぁぃぅぇぉアイウエオャュョァィゥェォ]/,
    ) !== -1
  )
}

/**
 * Checks if the given response contains invalid adjacent characters.
 *
 * This function identifies invalid sequences in Japanese where:
 * 1. The character ん or ン is repeated consecutively (んん or ンン).
 * 2. A small kana (ゃゅょぁぃぅぇぉ) or its katakana equivalent (ャュョァィゥェォ) is followed by another small kana.
 *
 * In proper Japanese writing, these sequences are considered invalid. This function helps in detecting such mistakes.
 *
 * @param {string} response - The string to check for invalid adjacent characters.
 * @returns {boolean} - Returns true if an invalid sequence is found; otherwise, false.
 *
 * @example
 * // Returns true because 'んん' is invalid
 * containsInvalidAdjacentCharacters('んん');
 *
 * @example
 * // Returns true because 'ゃょ' is invalid
 * containsInvalidAdjacentCharacters('ゃょ');
 *
 * @example
 * // Returns false because 'にんにん' is valid
 * containsInvalidAdjacentCharacters('にんにん');
 */
const containsInvalidAdjacentCharacters = (response: string): boolean => {
  return (
    response.search(/(んん|ンン)/) !== -1 ||
    /[んゃゅょぁぃぅぇぉンャュョァィゥェォ][ゃゅょぁぃぅぇぉャュョァィゥェォ]/.test(
      response,
    )
  )
}

/**
 * Checks if the given response starts with an invalid character.
 *
 * In Japanese, certain characters should not appear at the beginning of a word. This function identifies if the
 * response starts with any such invalid characters, including:
 * - Small kana (ゃ, ゅ, ょ, ぁ, ぃ, ぅ, ぇ, ぉ, っ, ゎ) and their katakana equivalents (ャ, ュ, ョ, ァ, ィ, ゥ, ェ, ォ, ッ, ヮ).
 * - The character ん (n) or its katakana equivalent ン.
 * - Other specific characters (ヵ, ヶ).
 *
 * @param {string} response - The string to check for an invalid starting character.
 * @returns {boolean} - Returns true if the response starts with an invalid character; otherwise, false.
 *
 * @example
 * // Returns true because 'ん' should not start a word
 * containsInvalidStartingCharacter('んにん');
 *
 * @example
 * // Returns true because 'ゃ' should not start a word
 * containsInvalidStartingCharacter('ゃくし');
 *
 * @example
 * // Returns false because 'たべる' starts with a valid character
 * containsInvalidStartingCharacter('たべる');
 */
const containsInvalidStartingCharacter = (response: string): boolean => {
  return /^[んゃゅょぁぃぅぇぉっゎンャュョァィゥェォヵヶッヮ]/.test(response)
}

/**
 * Checks if the given response contains any impossible kana sequences.
 *
 * This plugin aggregates several checks to identify invalid kana sequences in Japanese text, including:
 *
 * - Invalid starting characters.
 * - Invalid adjacent characters.
 * - Invalid usage of small っ (TSU).
 * - Invalid usage of small ゃ, ゅ, or ょ (YA, YU, YO).
 *
 * In proper Japanese writing, these sequences are considered invalid. This function helps in detecting such mistakes.
 * For detailed descriptions of each check, refer to the individual functions.
 */
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
