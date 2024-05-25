import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  ReviewTask,
  ReviewTaskUtils,
  answeredCorrectly,
  answeredIncorrectly,
} from '@/src/redux/reviewSlice'
import { SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { useCallback, useState } from 'react'
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type TaskState = 'correct' | 'incorrect' | 'notAnswered'

type CardProps = {
  task: ReviewTask
  textInputRef: React.RefObject<TextInput>
  onSubmit?: () => void
}

export const CardView = ({ task, textInputRef, onSubmit }: CardProps) => {
  const { styles } = useStyles(stylesheet)
  const dispatch = useAppDispatch()

  // const textInputRef = useRef<TextInput>(null)
  const [input, setInput] = useState('')
  const [taskState, setTaskState] = useState<TaskState>('notAnswered')

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
      if (ReviewTaskUtils.isReadingTask(task)) {
        // TODO: implement error threshold
        //  reading: wrong type used (oniyomi/kuniyomi)
        //  reading: 1 symbol derivation (or 1 symbol length difference)
        const subject = task.subject
        const matchedReading = subject.readings.find(el => el.reading === input)
        if (matchedReading === undefined) {
          setTaskState('incorrect')
        } else if (!matchedReading.accepted_answer) {
          setTaskState('incorrect')
        } else {
          setTaskState('correct')
        }
      } else {
        const subject = task.subject
        const matchedMeaning = subject.meanings.find(el => el.meaning === input)
        if (matchedMeaning === undefined) {
          setTaskState('incorrect')
        } else if (!matchedMeaning.accepted_answer) {
          setTaskState('incorrect')
        } else {
          setTaskState('correct')
        }
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
        <View style={styles.textInputBox}>
          <TextInput
            ref={textInputRef}
            // onLayout={() => textInputRef?.current?.focus()}
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
        </View>
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
  textInputBox: {
    padding: 20,
  },
  textInput: {
    ...typography.titleC,
    height: 48,
    minWidth: '80%',
  },
})
