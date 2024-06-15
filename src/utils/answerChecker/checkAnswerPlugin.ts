import { TaskType } from '@/src/types/quizTaskType'
import { SubjectType } from '@/src/types/subject'
import { AnswerCheckResult } from './types/answerCheckResult'
import { CheckAnswerResult } from './checkAnswerUtils'
import checkNPlugin from './plugins/checkNPlugin'
import checkKanjiPlugin from './plugins/checkKanjiPlugin'
import checkKanjiDoesNotStartWithToPlugin from './plugins/checkKanjiDoesNotStartWithToPlugin'
import checkKanjiReadingsPlugin from './plugins/checkKanjiReadingsPlugin'
import checkLongDashPlugin from './plugins/checkLongDashPlugin'
import checkRelatedMeaningsAndReadingsPlugin from './plugins/checkRelatedMeaningsAndReadingsPlugin'
import checkSmallHiraganaPlugin from './plugins/checkSmallHiraganaPlugin'
import checkThatVerbStartsWithToPlugin from './plugins/checkThatVerbStartsWithToPlugin'
import checkTransliteratedPlugin from './plugins/checkTransliteratedPlugin'
// import checkWarningListPlugin from './plugins/checkWarningListPlugin'
import checkImpossibleKanaPlugin from './plugins/checkImpossibleKanaPlugin'

export type CheckAnswerPluginInput = {
  subject: SubjectType
  taskType: TaskType
  response: string
  checkResult: CheckAnswerResult
  userSynonyms: string[]
}

export interface CheckAnswerPlugin {
  shouldEvaluate: ({
    subject,
    taskType,
    response,
    checkResult,
    userSynonyms,
  }: CheckAnswerPluginInput) => boolean
  evaluate: ({
    subject,
    taskType,
    response,
    checkResult,
    userSynonyms,
  }: CheckAnswerPluginInput) => AnswerCheckResult | undefined
}

export const plugins = [
  checkNPlugin,
  checkKanjiPlugin,
  checkKanjiDoesNotStartWithToPlugin,
  checkKanjiReadingsPlugin,
  checkLongDashPlugin,
  checkRelatedMeaningsAndReadingsPlugin,
  checkSmallHiraganaPlugin,
  checkThatVerbStartsWithToPlugin,
  checkTransliteratedPlugin,
  // This plugin requires additional data not provided by the API.
  // This endpoint could be used to retrieve the necessary data
  // https://www.wanikani.com/subjects/review/items?ids=512-68-2617
  // checkWarningListPlugin,
  checkImpossibleKanaPlugin,
]
