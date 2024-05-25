import { RollOutRight } from '@/src/animations/roll'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  init,
  reset,
  selectCurrentTask,
  selectNextTask,
  selectProgress,
  selectStatus,
} from '@/src/redux/reviewSlice'
import { fetchSubjects, selectSubjects } from '@/src/redux/subjectsSlice'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  View,
} from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CardView } from './CardView'
import {
  completionCopywritings,
  completionTitleCopywritings,
  getRandomCopywritings,
} from './utils'

export default function Index() {
  const dispatch = useAppDispatch()
  const params = useLocalSearchParams<{ subjects: string }>().subjects
  const { styles } = useStyles(stylesheet)
  const currentInputRef = useRef<TextInput>(null)
  const nextInputRef = useRef<TextInput>(null)
  const [currentCopywritings, setCurrentCopywritings] = useState<{
    title: string
    copy: string
  }>({ title: completionTitleCopywritings[0], copy: completionCopywritings[0] })

  const subjectIds = useMemo(() => {
    console.log('Processing params: ', params)
    return params
      ?.split(',')
      .map(el => parseInt(el))
      // .slice(0, 2)
  }, [params])
  console.log('SUBJECTS', subjectIds)
  const subjectsData = useAppSelector(state =>
    selectSubjects(state, subjectIds),
  )
  const reviewSliceStatus = useAppSelector(selectStatus)
  const currentTask = useAppSelector(selectCurrentTask)
  const nextTask = useAppSelector(selectNextTask)
  const progress = useAppSelector(selectProgress)
  const progressValue = useSharedValue(0)

  useEffect(() => {
    progressValue.value = withSpring(progress, {
      duration: 300,
      dampingRatio: 1.5,
      stiffness: 300,
    })
  }, [progress, progressValue])

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }))

  useEffect(() => {
    dispatch(reset())
  }, [dispatch])

  useEffect(() => {
    const randomCopywriting = getRandomCopywritings()
    setCurrentCopywritings(randomCopywriting)
  }, [])

  useEffect(() => {
    if (subjectIds !== undefined) {
      console.log('Sending fetchSubjects action with ', subjectIds.length)
      dispatch(fetchSubjects(subjectIds))
    }
  }, [subjectIds, dispatch])

  useEffect(() => {
    console.log('Sending SubjectsFetched action with ', subjectsData.length)
    dispatch(init(subjectsData))
  }, [subjectsData, dispatch])

  // Show keyboard after a timeout to avoid a bug with the keyboard being shown
  // during the page entering animation.
  useEffect(() => {
    if (currentTask !== undefined) {
      // Adjust the delay time to match the duration of your animation
      const timeoutId = setTimeout(() => {
        currentInputRef.current?.focus()
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [currentTask, currentInputRef])

  if (subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  // TODO: The cursor for TextInput is not in the middle when placeholder is in
  // place. To fix that custom placeholder should be implemented

  if (reviewSliceStatus === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  return (
    <Pressable
      style={{ height: '100%' }}
      onPress={Keyboard.dismiss}
      accessible={false}>
      <View style={styles.progressIndicatorContainer}>
        <Animated.View
          style={[styles.progressIndicator, progressAnimatedStyle]}>
          <Animated.View style={[styles.progressIndicatorHighlight]} />
        </Animated.View>
      </View>
      <View style={styles.pageContainer}>
        {nextTask && (
          <Animated.View
            style={{
              height: '100%',
              width: '100%',
              zIndex: 0,
              position: 'absolute',
              transform: [{ translateY: -4 }, { translateX: 3 }],
            }}
            key={nextTask.subject.id + nextTask.type}>
            <CardView task={nextTask} textInputRef={nextInputRef} />
          </Animated.View>
        )}
        {currentTask && (
          <Animated.View
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
            }}
            key={currentTask.subject.id + currentTask.type}
            exiting={RollOutRight.duration(500)}>
            <CardView
              task={currentTask}
              textInputRef={currentInputRef}
              onSubmit={() => nextInputRef.current?.focus()}
            />
          </Animated.View>
        )}
        {!currentTask && (
          <View style={styles.completionCard}>
            <Text style={styles.completionTextTitle}>
              {currentCopywritings.title}
            </Text>
            <View style={{ height: 16 }} />
            <Text style={styles.completionText}>
              {currentCopywritings.copy}
            </Text>
            <View style={{ height: 32 }} />
            <Link href='..' asChild>
              <Pressable style={styles.completionButton}>
                <Text style={styles.completionButtonText}>Done</Text>
              </Pressable>
            </Link>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const stylesheet = createStyleSheet({
  progressIndicatorContainer: {
    height: 20,
    backgroundColor: Colors.generalDarkGray,
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 8,
  },
  progressIndicator: {
    height: 20,
    backgroundColor: Colors.correctGreen,
    borderRadius: 10,
  },
  progressIndicatorHighlight: {
    marginTop: 4,
    marginHorizontal: 10,
    height: 8,
    backgroundColor: Colors.getLighter(Colors.correctGreen, 5),
    borderRadius: 16,
  },
  pageContainer: {
    flex: 1,
    margin: 30,
    justifyContent: 'center',
  },
  completionCard: {
    backgroundColor: Colors.blue,
    padding: 30,
    borderRadius: 8,
  },
  completionTextTitle: {
    ...typography.heading,
    color: 'white',
  },
  completionText: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.22,
    color: 'white',
  },
  completionButton: {
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 3,
    padding: 8,
    marginHorizontal: 16,
  },
  completionButtonText: {
    ...typography.body,
    color: Colors.blue,
  },
})
