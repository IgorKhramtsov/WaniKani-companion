import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch } from '@/src/hooks/redux'
import {
  ReviewTask,
  ReviewTaskUtils,
  answeredCorrectly,
  answeredIncorrectly,
} from '@/src/redux/reviewSlice'
import { SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native'
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
import { isMeaningCorrect, isReadingCorrect } from './utils'

type TaskState = 'correct' | 'incorrect' | 'notAnswered'

type CardProps = {
  task: ReviewTask
  textInputRef: React.RefObject<TextInput>
  onSubmit?: () => void
}

export const CardView = ({ task, textInputRef, onSubmit }: CardProps) => {
  const { styles } = useStyles(stylesheet)
  const dispatch = useAppDispatch()

  const [input, setInput] = useState('')
  const [taskState, setTaskState] = useState<TaskState>('notAnswered')
  const [hint, setHint] = useState<string | undefined>(undefined)

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
    // TODO: add confetti animation of emojis for correct answer
    // https://shopify.engineering/building-arrives-confetti-in-react-native-with-reanimated
    if (taskState === 'incorrect') {
      shakeInput()
    }
  }, [shakeInput, taskState])

  const submit = useCallback(
    (input: string) => {
      // Second submit will actually submit the task and move to the next (the
      //  same as web app works)
      if (taskState !== 'notAnswered') {
        const args = {
          id: task.subject.id,
          type: task.type,
        }
        if (taskState === 'incorrect') {
          dispatch(answeredIncorrectly(args))
        } else {
          dispatch(answeredCorrectly(args))
        }
        onSubmit?.()
        return
      }

      if (input.length === 0) return
      const result = ReviewTaskUtils.isReadingTask(task)
        ? isReadingCorrect(input, task.subject)
        : isMeaningCorrect(input, task.subject)
      if (result.status === 'correct') {
        setTaskState('correct')
      } else if (result.status === 'correctWithHint') {
        setTaskState('correct')
        setHint(result.hint)
      } else if (result.status === 'incorrect') {
        setTaskState('incorrect')
      } else if (result.status === 'hint') {
        setHint(result.hint)
      }
    },
    [dispatch, task, taskState, onSubmit],
  )

  const subject = task.subject
  const subjectColor = SubjectUtils.getAssociatedColor(subject)
  const subjectName = SubjectUtils.getSubjectName(subject)
  const taskName = StringUtils.capitalizeFirstLetter(task.type.toString())
  const taskStateColor =
    taskState === 'correct'
      ? Colors.correctGreen
      : taskState === 'incorrect'
        ? Colors.incorrectRed
        : undefined
  // const taskStateTextColor = taskState === 'notAnswered' ? undefined : 'white'
  const taskStateTextColor = 'white'

  return (
    <View style={[styles.card, { backgroundColor: subjectColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 0 }}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.glyphText}>{subject.characters}</Text>
          <Text style={styles.taskText}>
            {subjectName}{' '}
            <Text style={[styles.taskText, { fontWeight: '500' }]}>
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
            onChangeText={setInput}
            onSubmitEditing={_ => submit(input)}
            value={input}
            blurOnSubmit={false}
            placeholder='Your Response'
            autoCorrect={false}
            autoComplete={'off'}
            // TODO: can not set semi-transparent color of placeholder text
            // (although it looks like the default color is semi-transparent)
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

const stylesheet = createStyleSheet({
  glyphText: {
    ...typography.display1,
    color: 'white',
  },
  card: {
    // TODO: make responsive
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: 'black',
    shadowRadius: 12,
    shadowOpacity: 0.3,
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  taskText: {
    ...typography.titleB,
    fontWeight: '400',
    color: 'white',
  },
  hintContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  hintText: {
    ...typography.subheading,
    color: Colors.generalGray,
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
})
