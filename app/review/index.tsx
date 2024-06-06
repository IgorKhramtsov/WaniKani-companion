import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Text } from 'react-native'
import {
  completionCopywritings,
  completionTitleCopywritings,
  getRandomCopywritings,
} from './utils'
import { QuizPage } from '../quiz/QuizPage'

export default function Index() {
  const params = useLocalSearchParams<{
    assignmentIds: string
  }>()
  const [currentCopywritings, setCurrentCopywritings] = useState<{
    title: string
    copy: string
  }>({ title: completionTitleCopywritings[0], copy: completionCopywritings[0] })

  const assignmentIds = useMemo(() => {
    console.log(
      '[review] Processing assignmentIds from params: ',
      params.assignmentIds,
    )
    return params.assignmentIds?.split(',').map(el => parseInt(el))
  }, [params])
  console.log('[review] assignmentIds: ', assignmentIds)

  useEffect(() => {
    const randomCopywriting = getRandomCopywritings()
    setCurrentCopywritings(randomCopywriting)
  }, [])

  if (assignmentIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  return (
    <QuizPage
      mode={'review'}
      assignmentIds={assignmentIds}
      completionCopy={currentCopywritings.copy}
      completionTitle={currentCopywritings.title}
    />
  )
}
