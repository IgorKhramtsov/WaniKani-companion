import { TaskType } from '@/src/types/quizTaskType'
import { AnswerCheckResult } from './types/answerCheckResult'
import {
  CheckAnswerResult,
  checkMeaning,
  checkReading,
  normalizeString,
} from './checkAnswerUtils'
import { plugins } from './checkAnswerPlugin'
import { EnrichedSubject } from './types/enrichedSubject'

type CheckAnswerParams = {
  taskType: TaskType
  input: string
  subject: EnrichedSubject
}

export const checkAnswer = ({
  taskType,
  input,
  subject,
}: CheckAnswerParams): AnswerCheckResult => {
  let normalizedInput = normalizeString(input)
  const userSynonyms = subject.studyMaterial?.meaning_synonyms ?? []
  const checkResult =
    taskType === 'meaning'
      ? checkMeaning(normalizedInput, subject.subject, userSynonyms)
      : checkReading(normalizedInput, subject.subject)

  if (!checkResult.passed || (checkResult.passed && !checkResult.accurate)) {
    for (const plugin of plugins) {
      const shouldEvaluate = plugin.shouldEvaluate({
        checkResult,
        taskType,
        subject,
        response: normalizedInput,
        userSynonyms,
      })
      if (shouldEvaluate) {
        const result = plugin.evaluate({
          checkResult,
          taskType,
          subject,
          response: normalizedInput,
          userSynonyms,
        })
        if (result) {
          return result
        }
      }
    }
  }

  return {
    status: checkResult.passed
      ? checkResult.accurate
        ? 'correct'
        : 'correctWithHint'
      : 'incorrect',
    message: messageForCheckResult(checkResult, input, userSynonyms, taskType),
  }
}

const messageForCheckResult = (
  checkResult: CheckAnswerResult,
  response: string,
  userSynonyms: string[],
  taskType: TaskType,
) => {
  const isInSynonyms = userSynonyms
    .map(normalizeString)
    .includes(normalizeString(response))
  if (!checkResult.passed && isInSynonyms) {
    // In case there is user synonym that is also blacklisted by the system.
    return 'That’s one of your synonyms, but we can’t accept it because it’s not a valid meaning.'
  }
  if (checkResult.passed) {
    if (
      checkResult.passed &&
      checkResult.accurate &&
      checkResult.multipleAnswers
    ) {
      return `Did you know this item has multiple possible ${taskType}s?`
    }
    if (checkResult.passed && !checkResult.accurate) {
      return `Your answer was a bit off. Check the ${taskType} to make sure you are correct.`
    }
  } else {
    return `Need help? View the correct ${taskType} and mnemonic.`
  }
}
