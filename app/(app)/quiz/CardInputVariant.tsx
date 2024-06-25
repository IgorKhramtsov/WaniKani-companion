import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppSelector } from '@/src/hooks/redux'
import { QuizTask, selectTaskPair } from '@/src/redux/quizSlice'
import { SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  StretchInY,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Ionicons } from '@expo/vector-icons'
import wanakana from 'wanakana'
import FloatingEmojis, { FloatingEmojisRef } from './FloatingEmojis'
import * as Haptics from 'expo-haptics'
import AnimatedToastWrapper, {
  AnimatedToastWrapperRef,
} from './AnimatedToastWrapper'
import { appStyles } from '@/src/constants/styles'
import { selectAssignment } from '@/src/api/wanikaniApi'
import { srsStageToMilestone } from '@/src/types/assignment'
import { TaskStateWrapper } from './CardView'

type CardInputVariantProps = {
  textInputRef: React.RefObject<TextInput>
  submit: (input: string) => void
  taskState: TaskStateWrapper
  task: QuizTask
  hint: string | undefined
}

export const CardInputVariant = ({
  textInputRef,
  submit,
  taskState,
  task,
  hint,
}: CardInputVariantProps) => {
  const { styles } = useStyles(stylesheet)
  const [input, setInput] = useState('')
  const floatingEmojisRef = useRef<FloatingEmojisRef>(null)
  const toastRef = useRef<AnimatedToastWrapperRef>(null)

  const assignment = useAppSelector(selectAssignment(task.assignmentId))
  const taskPair = useAppSelector(selectTaskPair(task))

  const showToast = useCallback((content: ReactNode) => {
    toastRef.current?.show(content)
  }, [])

  const showCorrectFeedback = useCallback(() => {
    floatingEmojisRef.current?.spawnEmojis(16)
  }, [floatingEmojisRef])

  const shakeAnimation = useSharedValue(0)

  const shakeInput = useCallback(
    () =>
      (shakeAnimation.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 65 }),
          withTiming(0, { duration: 65 }),
        ),
        2,
      )),
    [shakeAnimation],
  )
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }))

  useEffect(() => {
    // Show toast only before report (task answered correctly)
    if (taskState.state !== 'correct') return
    // Show toast only if pair task is completed
    if (taskPair !== false && !(taskPair?.completed ?? true)) return
    if (!assignment || taskPair === undefined) return
    const hasFailed =
      task.numberOfErrors > 0 ||
      (taskPair === false ? false : taskPair.numberOfErrors > 0)
    console.log('taskPair', taskPair)
    console.log('task', task)

    const newStage = assignment.srs_stage + (hasFailed ? -1 : 1)
    const newStageName = srsStageToMilestone(newStage)

    const backgroundColor = hasFailed ? Colors.incorrectRed : Colors.green
    const iconName = hasFailed
      ? 'arrow-down-circle-outline'
      : 'arrow-up-circle-outline'
    showToast(
      <View style={[styles.toastContent, { backgroundColor }]}>
        <Ionicons name={iconName} size={24} color='white' />
        <View style={{ width: 8 }} />
        <Text style={styles.toastText}>{newStageName}</Text>
      </View>,
    )
  }, [
    assignment,
    taskPair,
    showToast,
    styles.toastContent,
    styles.toastText,
    taskState.state,
    task.numberOfErrors,
    task,
  ])

  useEffect(() => {
    if (taskState.state === 'incorrect' || taskState.state === 'warning') {
      if (taskState.state === 'incorrect') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      } else if (taskState.state === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }
      shakeInput()
    }
    if (taskState.state === 'correct') {
      showCorrectFeedback()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }, [shakeInput, taskState, showCorrectFeedback])

  const setInputAndConvert = useCallback(
    (input: string) => {
      if (task.type === 'reading') {
        // IME mode is needed to avoid converting 'n' to 'ん' during the typing
        // so that it is possible to type na/ni etc.
        setInput(wanakana.toHiragana(input, { IMEMode: 'toHiragana' }))
      } else {
        setInput(input)
      }
    },
    [setInput, task.type],
  )

  const subject = task.subject.subject
  const subjectName = SubjectUtils.getSubjectName(subject)
  const taskName = StringUtils.capitalizeFirstLetter(task.type.toString())
  const taskStateColor =
    taskState.state === 'correct'
      ? Colors.correctGreen
      : taskState.state === 'incorrect'
        ? Colors.incorrectRed
        : undefined
  const taskStateTextColor = 'white'

  return (
    <Fragment>
      <View style={styles.cardTextContainer}>
        <AnimatedToastWrapper ref={toastRef}>
          <Text style={styles.glyphText}>{subject.characters}</Text>
        </AnimatedToastWrapper>
        <Text style={styles.taskText}>
          {subjectName}{' '}
          <Text
            style={[
              styles.taskText,
              { fontWeight: '500' },
              task.type === 'reading' ? styles.taskTextReading : {},
            ]}>
            {taskName}
          </Text>
        </Text>
      </View>
      <View style={{ height: 20 }} />
      {hint && (
        <Animated.View
          style={styles.hintContainer}
          entering={StretchInY.duration(200)}>
          <Text style={styles.hintText}>{hint}</Text>
        </Animated.View>
      )}
      <Animated.View style={[styles.textInputBox, animatedStyle]}>
        <FloatingEmojis ref={floatingEmojisRef}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              {
                backgroundColor: taskStateColor,
                color: taskStateTextColor,
              },
            ]}
            textAlign={'center'}
            onChangeText={input => setInputAndConvert(input)}
            onSubmitEditing={_ => submit(input)}
            value={input}
            blurOnSubmit={false}
            placeholder='Your Response'
            autoCorrect={false}
            autoComplete={'off'}
            // TODO: can not set semi-transparent color of placeholder text
            // (although it looks like the default color is semi-transparent)
          />
        </FloatingEmojis>
      </Animated.View>
    </Fragment>
  )
}

const stylesheet = createStyleSheet({
  glyphText: {
    ...typography.display1,
    color: 'white',
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  taskText: {
    ...typography.titleB,
    fontWeight: '400',
    color: 'white',
  },
  taskTextReading: {
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    textDecorationColor: 'white',
  },
  hintContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  hintText: {
    ...typography.subheading,
    color: Colors.grayEA,
  },
  textInputBox: {
    padding: 20,
  },
  textInput: {
    ...typography.titleC,
    height: 48,
    minWidth: '80%',
    borderRadius: 8,
  },
  toastContent: {
    ...appStyles.row,
    backgroundColor: Colors.green,
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  toastText: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.1,
    color: 'white',
    fontWeight: '600',
  },
})
