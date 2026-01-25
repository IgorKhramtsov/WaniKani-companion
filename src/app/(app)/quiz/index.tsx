import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { Text } from 'react-native'
import { QuizPage } from '../quiz/QuizPage'
import { QuizMode } from '@/src/types/quizType'

export default function Index() {
  const params = useLocalSearchParams<{
    subjectIds: string
    assignmentIds: string
    moreLessonIds: string
    quizMode: QuizMode
  }>()

  const subjectIds = useMemo(() => {
    return params.subjectIds?.split(',').map(el => parseInt(el))
  }, [params.subjectIds])

  const assignmentIds = useMemo(() => {
    return params.assignmentIds?.split(',').map(el => parseInt(el))
  }, [params.assignmentIds])

  const moreLessonIds = useMemo(() => {
    return params.moreLessonIds?.split(',').map(el => parseInt(el))
  }, [params.moreLessonIds])

  if (assignmentIds === undefined && subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (assignmentIds !== undefined) {
    return (
      <QuizPage
        mode={'lessonsQuiz'}
        assignmentIds={assignmentIds}
        moreLessonIds={moreLessonIds}
      />
    )
  } else if (subjectIds !== undefined) {
    return <QuizPage mode={'quiz'} subjectIds={subjectIds} />
  }

  throw new Error('No subjectIds or assignmentIds')
}
