import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { Text } from 'react-native'
import { QuizPage } from '../quiz/QuizPage'

export default function Index() {
  const params = useLocalSearchParams<{
    assignmentIds: string
  }>()

  const assignmentIds = useMemo(() => {
    console.log(
      '[review] Processing assignmentIds from params: ',
      params.assignmentIds,
    )
    return params.assignmentIds?.split(',').map(el => parseInt(el))
  }, [params.assignmentIds])
  console.log('[review] assignmentIds: ', assignmentIds)

  if (assignmentIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  return <QuizPage mode={'review'} assignmentIds={assignmentIds} />
}
