import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { Text } from 'react-native'
import { QuizPage } from '../quiz/QuizPage'

export default function Index() {
  const params = useLocalSearchParams<{
    subjectIds: string
    assignmentIds: string
  }>()

  const subjectIds = useMemo(() => {
    console.log('[quiz] Processing subjectIds from params: ', params.subjectIds)
    return params.subjectIds?.split(',').map(el => parseInt(el))
  }, [params.subjectIds])
  console.log('[quiz] subjectIds: ', subjectIds)

  const assignmentIds = useMemo(() => {
    console.log(
      '[quiz] Processing assignmentIds from params: ',
      params.assignmentIds,
    )
    return params.assignmentIds?.split(',').map(el => parseInt(el))
  }, [params.assignmentIds])
  console.log('[quiz] assignmentIds: ', assignmentIds)

  if (assignmentIds === undefined && subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (assignmentIds !== undefined) {
    return <QuizPage mode={'lessonsQuiz'} assignmentIds={assignmentIds} />
  } else if (subjectIds !== undefined) {
    return <QuizPage mode={'quiz'} subjectIds={subjectIds} />
  }

  throw new Error('No subjectIds or assignmentIds')
}
