import { Kanji } from '@/src/types/kanji'
import { SubjectType } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { StringUtils } from '@/src/utils/stringUtils'

export const completionTitleCopywritings = ['Huzzah! ', 'Hurrah!']

export const completionCopywritings = [
  'Your reviews are complete, forging your path to mastery. Well done, mighty learner!',
  'You’ve conquered your reviews! Your recall is sharper and your knowledge is growing stronger. Keep up the great work!',
]

export const getRandomCopywritings = () => {
  return {
    title:
      completionTitleCopywritings[
        Math.floor(Math.random() * completionTitleCopywritings.length)
      ],
    copy: completionCopywritings[
      Math.floor(Math.random() * completionCopywritings.length)
    ],
  }
}

type Result = {
  status: 'correct' | 'incorrect' | 'correctWithHint' | 'hint'
  hint?: string
}

export const isReadingCorrect = (
  answer: string,
  subject: Vocabulary | Kanji,
): Result => {
  //  reading: wrong type used (oniyomi/kuniyomi)
  const matchedReading = subject.readings.find(el => el.reading === answer)
  console.log('READINGS: ', subject.readings)
  if (matchedReading === undefined) {
    return {
      status: 'incorrect',
    }
  } else if (!matchedReading.accepted_answer) {
    return {
      status: 'incorrect',
    }
  } else {
    return {
      status: 'correct',
    }
  }
}

export const isMeaningCorrect = (
  answer: string,
  subject: SubjectType,
): Result => {
  const sanitizedAnswer = answer.trim().toLowerCase()
  const meanings = [
    ...subject.meanings.filter(el => el.accepted_answer),
    ...subject.auxiliary_meanings.filter(el => el.type === 'whitelist'),
  ]
  console.log('MEANINGS: ', meanings)

  const comparisonResult =
    StringUtils.compareStringWithArrayWithThresholdEnsuringNumbers(
      sanitizedAnswer,
      meanings.map(el => el.meaning),
    )
  if (comparisonResult.result === 'equal') {
    return {
      status: 'correct',
    }
  } else if (comparisonResult.result === 'almost') {
    return {
      status: 'correctWithHint',
      hint: 'Your answer was a bit off. Check the meaning to make sure you are correct.',
    }
  } else {
    return {
      status: 'incorrect',
    }
  }
}