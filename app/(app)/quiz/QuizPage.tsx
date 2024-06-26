import { RollOutRight } from '@/src/animations/roll'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  init,
  markTaskPairAsReported,
  selectCurrentTask,
  selectNextTask,
  selectProgress,
  selectTaskPairsForReport,
  selectWrapUpEnabled,
  selectWrapUpRemainingTasks,
  toggleWrapUp,
} from '@/src/redux/quizSlice'
import { Link, useNavigation } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CardView } from './CardView'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { QuizMode } from '@/src/types/quizType'
import {
  selectAssignments,
  useCreateReviewMutation,
  useStartAssignmentMutation,
} from '@/src/api/wanikaniApi'
import { CreateReviewParams } from '@/src/types/createReviewParams'
import { selectEnrichedSubjects } from '@/src/redux/subjectsSlice'
import { MenuView } from '@react-native-menu/menu'
import { FontAwesome6 } from '@expo/vector-icons'

interface BaseProps {
  mode: QuizMode
  completionTitle?: string
  completionCopy?: string
}

interface SubjectProps extends BaseProps {
  mode: 'quiz'
  subjectIds: number[]
}

interface AssignmentProps extends BaseProps {
  mode: 'review' | 'lessonsQuiz'
  assignmentIds: number[]
}

const isAssignmentProps = (
  props: SubjectProps | AssignmentProps,
): props is AssignmentProps => {
  return props.mode !== 'quiz'
}
const isSubjectProps = (
  props: SubjectProps | AssignmentProps,
): props is SubjectProps => {
  return props.mode === 'quiz'
}

export const QuizPage = (props: SubjectProps | AssignmentProps) => {
  const { completionCopy, completionTitle } = props
  const dispatch = useAppDispatch()
  const { styles } = useStyles(stylesheet)
  const currentInputRef = useRef<TextInput>(null)
  const nextInputRef = useRef<TextInput>(null)

  let assignmentIds = useMemo(() => {
    if (isAssignmentProps(props)) {
      return props.assignmentIds
    }
    return []
  }, [props])

  const assignments = useAppSelector(selectAssignments(assignmentIds))

  const resolvedSubjectIds = useMemo(() => {
    console.log('[QuizPage] resolving subjectIds')
    if (isSubjectProps(props)) {
      return props.subjectIds
    }
    return assignments.map(assignment => assignment.subject_id)
  }, [props, assignments])

  // Hydrate subjectsSlice with data
  const { isLoading: isSubjectCacheLoading } =
    useSubjectCache(resolvedSubjectIds)
  // Select enriched data from the subjectsSlice
  const enrichedSubjects = useAppSelector(
    selectEnrichedSubjects(resolvedSubjectIds),
  )

  const wrapUpEnabled = useAppSelector(selectWrapUpEnabled)
  const wrapUpRemaningTasks = useAppSelector(selectWrapUpRemainingTasks)
  const currentTask = useAppSelector(selectCurrentTask)
  const nextTask = useAppSelector(selectNextTask)
  const progress = useAppSelector(selectProgress)
  const taskPairsForReport = useAppSelector(selectTaskPairsForReport)
  const [startAssignment] = useStartAssignmentMutation()
  const [createReview] = useCreateReviewMutation()
  // Prevent old slice state from being used before we hydrated it with new
  // data.
  const [initiated, setInitiated] = useState(false)

  const isLoading = useMemo(() => {
    console.log('[QuizPage]: isLoading', isSubjectCacheLoading, initiated)
    return isSubjectCacheLoading || !initiated
  }, [isSubjectCacheLoading, initiated])

  const progressValue = useSharedValue(0)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    // When new report is created, the api slice will invalidate Reviews cache
    // by fetching them again, this will trigger reviews selector which will
    // trigger this function and re-initiate the quiz slice in the middle of
    // review. This is a workaround to not initialize it twice.
    if (initiated) return

    if (isSubjectProps(props)) {
      console.log('[QuizPage]: dispatching init for quiz')
      dispatch(init({ enrichedSubjects, mode: props.mode }))
    } else if (isAssignmentProps(props)) {
      if (enrichedSubjects.length === 0 || assignments.length === 0) {
        console.log('[QuizPage]: subjects or assignments are empty. Waiting.')
        return
      } else {
        console.log(
          '[QuizPage]: dispatching init with assignments and subjects',
        )
        dispatch(init({ enrichedSubjects, assignments, mode: props.mode }))
      }
    } else {
      throw new Error(
        'Invalid state. QuizPage should be passed either subject or assignment props.',
      )
    }
    setInitiated(true)
  }, [enrichedSubjects, dispatch, assignments, props, initiated])

  const navigation = useNavigation()
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MenuView
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === 'wrap-up') {
              dispatch(toggleWrapUp())
            }
          }}
          actions={[
            {
              id: 'wrap-up',
              attributes: {
                disabled: wrapUpRemaningTasks.length === 0,
              },
              title: wrapUpEnabled
                ? 'Cancel Wrap Up'
                : `Wrap Up (${wrapUpRemaningTasks.length})`,
            },
          ]}>
          <FontAwesome6 name='ellipsis' size={24} color='black' />
        </MenuView>
      ),
    })
  }, [dispatch, navigation, wrapUpEnabled, wrapUpRemaningTasks.length])

  useEffect(() => {
    for (const taskPair of taskPairsForReport) {
      switch (props.mode) {
        case 'lessonsQuiz':
          const assignmentId = taskPair[0].assignmentId
          if (assignmentId === undefined) {
            if (__DEV__) {
              throw new Error('assignmentId is undefined')
            }
            return
          }
          startAssignment(assignmentId)
          break
        case 'review':
          const readingTask = taskPair.find(task => task.type === 'reading')
          const meaningTask = taskPair.find(task => task.type === 'meaning')
          if (meaningTask === undefined) {
            if (__DEV__) {
              throw new Error('meaningTask is undefined')
            }
            return
          }
          if (
            meaningTask.subject.subject.type === 'kanji' ||
            meaningTask.subject.subject.type === 'vocabulary'
          ) {
            if (readingTask === undefined) {
              if (__DEV__) {
                throw new Error(
                  'readingTask is undefined for kanji or vocabulary',
                )
              }
              return
            }
          }
          const params: CreateReviewParams = {
            subject_id: meaningTask.subject.subject.id,
            incorrect_meaning_answers: meaningTask.numberOfErrors,
            incorrect_reading_answers: readingTask?.numberOfErrors ?? 0,
          }
          createReview(params).then(result => {
            if (result.error === undefined) {
              if (props.mode === 'review') {
                console.log('Review created successfully')
              } else if (props.mode === 'lessonsQuiz') {
                console.log('Assignment started successfully')
              }
              dispatch(markTaskPairAsReported({ taskPair: taskPair }))
            } else {
              console.error('Error reporting task pair', result.error)
            }
          })
          break
      }
    }
  }, [createReview, startAssignment, dispatch, props, taskPairsForReport])

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

  // Show keyboard after a timeout to avoid a bug with the keyboard being shown
  // during the page entering animation.
  // TODO: depend on focus instead of keyboard. This way you can use it
  // correctly in keyboardless mode (emulator)
  useEffect(() => {
    if (currentTask !== undefined) {
      // Adjust the delay time to match the duration of your animation
      const timeoutId = setTimeout(() => {
        currentInputRef.current?.focus()
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [currentTask, currentInputRef])

  // Keep track of keyboard state
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  const transitionDuration = 500
  const nextTaskTransformStyle = {
    translateY: 32,
    scale: 0.9,
  }

  const transitionProgress = useSharedValue(0)

  useEffect(() => {
    // Trigger transition when currentTask changes
    transitionProgress.value = 0
    transitionProgress.value = withTiming(1, { duration: transitionDuration })
  }, [currentTask, transitionProgress])

  const currentTaskStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            transitionProgress.value,
            [0, 1],
            [nextTaskTransformStyle.translateY, 0],
          ),
        },
        {
          scale: interpolate(
            transitionProgress.value,
            [0, 1],
            [nextTaskTransformStyle.scale, 1],
          ),
        },
      ],
    }
  })

  if (isLoading) {
    return <FullPageLoading />
  }

  // TODO: The cursor for TextInput is not in the middle when placeholder is in
  // place. To fix that custom placeholder should be implemented

  return (
    <Pressable
      style={{ height: '100%' }}
      // Disable pressable when keyboard is not shown. This is to avoid issue
      // with scrollable for info view of card
      disabled={!isKeyboardVisible}
      onPress={Keyboard.dismiss}
      accessible={false}>
      {currentTask !== undefined && (
        <View style={styles.progressIndicatorContainer}>
          <Animated.View
            style={[styles.progressIndicator, progressAnimatedStyle]}>
            <Animated.View style={[styles.progressIndicatorHighlight]} />
          </Animated.View>
        </View>
      )}
      <View style={styles.pageContainer}>
        {nextTask && (
          // Show next task in order to keep the keyboard always open (we focus
          // the next task's input node when current one is leaving the scene)
          // NOTE: The sub-tree should be the same as for the currentTask to
          // support seamless focus move for the keyboard.
          <Animated.View
            pointerEvents='none'
            key={
              nextTask.subject.subject.id +
              nextTask.type +
              nextTask.numberOfErrors
            }
            style={{
              height: '100%',
              width: '100%',
              zIndex: 0,
              position: 'absolute',
              transform: [
                { translateY: nextTaskTransformStyle.translateY },
                { scale: nextTaskTransformStyle.scale },
              ],
            }}>
            <Animated.View>
              <CardView task={nextTask} textInputRef={nextInputRef} />
            </Animated.View>
          </Animated.View>
        )}
        {currentTask && (
          <Animated.View
            key={
              currentTask.subject.subject.id +
              currentTask.type +
              currentTask.numberOfErrors
            }
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
            }}
            exiting={RollOutRight.duration(transitionDuration)}>
            <Animated.View
              // To avoid conflicts with styling and exiting animation - we
              // need to introduce separate AnimatedViews for them
              style={[
                {
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                },
                currentTaskStyle,
              ]}>
              <CardView
                task={currentTask}
                textInputRef={currentInputRef}
                onSubmit={() => nextInputRef.current?.focus()}
              />
            </Animated.View>
          </Animated.View>
        )}
        {!currentTask && completionTitle && completionCopy && (
          <View style={styles.completionCard}>
            <Text style={styles.completionTextTitle}>{completionTitle}</Text>
            <View style={{ height: 16 }} />
            <Text style={styles.completionText}>{completionCopy}</Text>
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
    backgroundColor: Colors.grayDA,
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
