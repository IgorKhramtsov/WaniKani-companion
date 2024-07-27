import {
  PayloadAction,
  SerializedError,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { Subject, SubjectUtils } from '../types/subject'
import { Vocabulary } from '../types/vocabulary'
import { Kanji } from '../types/kanji'
import { RootState } from './store'
import { Assignment } from '../types/assignment'
import { QuizMode } from '../types/quizType'
import { TaskType } from '../types/quizTaskType'
import { EnrichedSubject } from '../utils/answerChecker/types/enrichedSubject'
import _ from 'lodash'

interface BaseQuizTask {
  numberOfErrors: number
  completed: boolean
  reported: boolean
  type: TaskType
  assignmentId?: number
}

interface QuizReadingTask extends BaseQuizTask {
  subject: EnrichedSubject<Vocabulary | Kanji>
  type: 'reading'
}
interface QuizMeaningTask extends BaseQuizTask {
  subject: EnrichedSubject<Subject>
  type: 'meaning'
}

export type QuizTask = QuizReadingTask | QuizMeaningTask

export namespace QuizTaskUtils {
  export function isMeaningTask(task: QuizTask): task is QuizMeaningTask {
    return task.type === 'meaning'
  }

  export function isReadingTask(task: QuizTask): task is QuizReadingTask {
    return task.type === 'reading'
  }
}

const createReadingTask = (
  subject: EnrichedSubject<Vocabulary | Kanji>,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'reading',
  numberOfErrors: 0,
  completed: false,
  reported: false,
  assignmentId,
})

const createMeaningTask = (
  subject: EnrichedSubject<Subject>,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'meaning',
  numberOfErrors: 0,
  completed: false,
  reported: false,
  assignmentId,
})

export interface QuizSlice {
  remainingTasks: QuizTask[]
  completedTasks: QuizTask[]
  mode: QuizMode
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
  wrapUpEnabled: boolean
}

const initialState: QuizSlice = {
  remainingTasks: [],
  completedTasks: [],
  status: 'loading',
  mode: 'quiz',
  wrapUpEnabled: false,
}

export const quizSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    init(
      state,
      action: PayloadAction<{
        assignments?: Assignment[]
        enrichedSubjects: EnrichedSubject[]
        mode: QuizMode
      }>,
    ) {
      console.log(
        '[QuizSlice] INIT mode: ',
        action.payload.mode,
        'subjects: ',
        action.payload.enrichedSubjects.length,
        ' assignments: ',
        action.payload?.assignments?.length,
      )
      if (action.payload.enrichedSubjects.length === 0) return

      const readingTasks: QuizTask[] = []
      const meaningTasks: QuizTask[] = []

      const createTasksFor = (
        subject: EnrichedSubject,
        assignment?: Assignment,
      ) => {
        const isReadingTaskRequired = (
          subject: EnrichedSubject,
        ): subject is EnrichedSubject<Vocabulary | Kanji> =>
          SubjectUtils.isVocabulary(subject.subject) ||
          SubjectUtils.isKanji(subject.subject)

        if (isReadingTaskRequired(subject)) {
          readingTasks.push(createReadingTask(subject, assignment?.id))
        }
        meaningTasks.push(createMeaningTask(subject, assignment?.id))
      }

      // Shuffle subjects so that we have radicals kanji and vocabulary mixed
      const shuffledAssignments = _.shuffle(action.payload.assignments)

      if (shuffledAssignments.length > 0) {
        for (const assignment of shuffledAssignments) {
          const subject = action.payload.enrichedSubjects.find(
            subject => subject.subject.id === assignment.subject_id,
          )
          if (subject === undefined) {
            console.error('Can not find subject for assignment: ', assignment)
            continue
          }
          createTasksFor(subject, assignment)
        }
      } else {
        // If there are no assignments - we might be in a quiz mode. Create
        // tasks just based on subjects.

        const shuffledEnrichedSubjects = _.shuffle(
          action.payload.enrichedSubjects,
        )
        for (const subject of shuffledEnrichedSubjects) {
          createTasksFor(subject)
        }
      }

      const newState = Object.assign({}, initialState)
      // TODO: Respect user's setting of review ordering
      newState.mode = action.payload.mode
      newState.remainingTasks = getShuffledTasks(readingTasks, meaningTasks)
      // Print out number of subsequent tasks of the same type
      // User reduce to create arrays of {TaskType, count}
      const taskTypeCount = newState.remainingTasks.reduce(
        (acc, task) => {
          if (acc.length === 0 || acc[acc.length - 1].taskType !== task.type) {
            acc.push({ taskType: task.type, count: 1 })
          } else {
            acc[acc.length - 1].count++
          }
          return acc
        },
        [] as { taskType: TaskType; count: number }[],
      )
      console.log(
        '[quizSlice] taskTypeCount after shuffle:',
        taskTypeCount.map(e => `${e.taskType}: ${e.count}`),
      )
      console.log('tasksLen:', newState.remainingTasks.length)
      newState.status = 'idle'
      return newState
    },
    toggleWrapUp(state) {
      state.wrapUpEnabled = !state.wrapUpEnabled
    },
    answeredCorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const task = state.remainingTasks.find(
        task =>
          task.type === action.payload.type &&
          task.subject.subject.id === action.payload.id,
      )
      if (task === undefined) {
        console.error(
          'answeredCorrectly can not find task for: id -',
          action.payload.id,
          'type -',
          action.payload.type,
        )
        return
      }
      state.remainingTasks.splice(state.remainingTasks.indexOf(task), 1)
      task.completed = true
      state.completedTasks.push(task)
    },
    answeredIncorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const task = state.remainingTasks.find(
        task =>
          task.type === action.payload.type &&
          task.subject.subject.id === action.payload.id,
      )
      if (task === undefined) {
        console.error(
          'answeredIncorrectly can not find task for: id -',
          action.payload.id,
          'type -',
          action.payload.type,
        )
        return
      }
      state.remainingTasks.splice(state.remainingTasks.indexOf(task), 1)
      task.numberOfErrors++

      // TODO: fix task pushing in wrap up mode
      // TODO: improve task pushing to avoid introduction of single reading
      // task among meaning tasks
      const minPushDistance = 3
      const maxPushDistance = 9
      const randomNumber =
        minPushDistance +
        Math.floor(Math.random() * (maxPushDistance - minPushDistance))
      const newPos = Math.min(randomNumber, state.remainingTasks.length)
      state.remainingTasks.splice(newPos, 0, task)
    },
    markTaskPairAsReported(
      state,
      action: PayloadAction<{ taskPair: QuizTask[] }>,
    ) {
      const tasks = state.completedTasks.filter(
        task =>
          task.subject.subject.id ===
          action.payload.taskPair[0].subject.subject.id,
      )

      if (tasks === undefined) {
        console.error('Can not find tasks for:', action.payload.taskPair)
        return
      }
      tasks.forEach(task => (task.reported = true))
    },
  },
})

const getShuffledTasks = (
  readingTasks: QuizTask[],
  meaningTasks: QuizTask[],
): QuizTask[] => {
  const minNumberOfSubsequentTasks = 5
  const maxNumberOfSubsequentTasks = 10

  const resultArray: QuizTask[] = []
  let taskToPush =
    Math.random() <= 0.5 ? readingTasks.pop() : meaningTasks.pop()
  let subsequentTaskOfTheSameType = 1
  do {
    if (taskToPush !== undefined) {
      resultArray.push(taskToPush)
    }

    const lastTaskType = resultArray[resultArray.length - 1]?.type

    let preferableSupplyArray =
      lastTaskType === 'reading' ? readingTasks : meaningTasks
    let secondarySupplyArray =
      lastTaskType === 'reading' ? meaningTasks : readingTasks

    const preferableTask = (() => {
      if (subsequentTaskOfTheSameType < minNumberOfSubsequentTasks) {
        return preferableSupplyArray.pop()
      } else if (subsequentTaskOfTheSameType >= maxNumberOfSubsequentTasks) {
        return secondarySupplyArray.pop()
      } else {
        return Math.random() <= 0.7
          ? preferableSupplyArray.pop()
          : secondarySupplyArray.pop()
      }
    })()

    taskToPush = preferableTask ?? readingTasks.pop() ?? meaningTasks.pop()
    if (lastTaskType === taskToPush?.type) {
      subsequentTaskOfTheSameType++
    } else {
      subsequentTaskOfTheSameType = 1
    }
  } while (taskToPush !== undefined)

  return resultArray
}

export const {
  init,
  toggleWrapUp,
  answeredCorrectly,
  answeredIncorrectly,
  markTaskPairAsReported,
} = quizSlice.actions

export const selectWrapUpRemainingTasks = createSelector(
  (state: RootState) => state.quizSlice.remainingTasks,
  (state: RootState) => state.quizSlice.completedTasks,
  (remainingTasks: QuizTask[], completedTasks: QuizTask[]) => {
    const completedSubjectIds = completedTasks.map(
      task => task.subject.subject.id,
    )
    return remainingTasks.filter(task =>
      completedSubjectIds.includes(task.subject.subject.id),
    )
  },
)

const selectRemainingTasks = createSelector(
  (state: RootState) => state.quizSlice.remainingTasks,
  selectWrapUpRemainingTasks,
  (state: RootState) => state.quizSlice.wrapUpEnabled,
  (
    remainingTasks: QuizTask[],
    remainingWrapUpTasks: QuizTask[],
    wrapUpEnabled: boolean,
  ) => {
    if (wrapUpEnabled) {
      return remainingWrapUpTasks
    }
    return remainingTasks
  },
)

export const selectStatus = (state: RootState) => state.quizSlice.status
export const selectWrapUpEnabled = (state: RootState) =>
  state.quizSlice.wrapUpEnabled
export const selectProgress = createSelector(
  selectRemainingTasks,
  (state: RootState) => state.quizSlice.completedTasks,
  (state: RootState) => state.quizSlice.wrapUpEnabled,
  (remainingTasks, completedTasks) => {
    const completed = completedTasks.length
    const remaining = remainingTasks.length
    const total = remaining + completed
    if (total === 0) return 0

    return Math.floor((completed / total) * 100)
  },
)
export const selectCurrentTask = createSelector(
  selectRemainingTasks,
  remainingTasks => remainingTasks[0],
)
export const selectNextTask = createSelector(
  selectRemainingTasks,
  (remainingTasks): QuizTask | undefined => remainingTasks[1],
)
export const selectTaskPairsForReport = createSelector(
  (state: RootState) => state.quizSlice.completedTasks,
  (state: RootState) => state.quizSlice.mode,
  (tasks, mode) => {
    // We have nothing to report in quiz mode
    if (mode === 'quiz') return []

    const notReportedTasks = tasks.filter(task => !task.reported)
    const notReportedMeaningTasks = notReportedTasks.filter(
      task => task.type === 'meaning',
    )
    const notReportedReadings = notReportedTasks.filter(
      task => task.type === 'reading',
    )
    const readyForReportPairs = notReportedMeaningTasks.map(task => {
      if (
        task.subject.subject.type === 'radical' ||
        task.subject.subject.type === 'kana_vocabulary'
      ) {
        return [task]
      }
      const answeredReadingPair = notReportedReadings.find(
        readingTask =>
          readingTask.subject.subject.id === task.subject.subject.id,
      )
      if (answeredReadingPair !== undefined) {
        return [task, answeredReadingPair]
      } else {
        // The pair task is not completed yet
      }

      return undefined
    })
    return readyForReportPairs.filter(
      (taskPair): taskPair is QuizTask[] => taskPair !== undefined,
    )
  },
)

export const selectTaskPair = (task: QuizTask) =>
  createSelector(
    (state: RootState) => state.quizSlice.completedTasks,
    (tasks): QuizTask | undefined | false => {
      if (task.type === 'meaning') {
        if (
          task.subject.subject.type === 'radical' ||
          task.subject.subject.type === 'kana_vocabulary'
        ) {
          return false
        }

        const readingTask = tasks.find(
          readingTask =>
            readingTask.subject.subject.id === task.subject.subject.id &&
            readingTask.type === 'reading',
        )

        return readingTask
      } else {
        // This is reading task. Look for meaning pair
        const meaningTask = tasks.find(
          meaningTask =>
            meaningTask.subject.subject.id === task.subject.subject.id &&
            meaningTask.type === 'meaning',
        )

        return meaningTask
      }
    },
  )

export default quizSlice.reducer
