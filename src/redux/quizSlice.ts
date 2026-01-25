import {
  PayloadAction,
  SerializedError,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { RootState } from './store'
import { QuizMode } from '../types/quizType'
import { TaskType } from '../types/quizTaskType'
import _ from 'lodash'
import { SubjectType } from '../types/subject'
import {
  QueueState,
  QueueManagerHelpers,
  initialQueueState,
} from '@/src/utils/QueueManager'
import { filterNotUndefined } from '../utils/arrayUtils'
import { QuizTask, QuizTaskHandle } from '../types/quizTask'

export interface QuizInitElement {
  assignmentId?: number
  subjectId: number
  subjectType: SubjectType
}

const getKey = (element: QuizTaskHandle) =>
  `${element.subjectId}-${element.type}`

const createTask = (element: QuizInitElement, type: TaskType): QuizTask => ({
  subjectId: element.subjectId,
  subjectType: element.subjectType,
  type: type,
  numberOfErrors: 0,
  completed: false,
  reported: false,
  assignmentId: element.assignmentId,
})

export interface QuizSlice {
  queueState: QueueState
  wrapUpQueueState: QueueState
  tasks: Record<string, QuizTask>
  completedTasks: QuizTask[]
  mode: QuizMode
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
  wrapUpEnabled: boolean
}

const initialState: QuizSlice = {
  queueState: initialQueueState,
  wrapUpQueueState: initialQueueState,
  tasks: {},
  completedTasks: [],
  status: 'loading',
  mode: 'quiz',
  wrapUpEnabled: false,
}

export const quizSlice = createSlice({
  reducerPath: 'quizSlice',
  name: 'quiz',
  initialState,
  reducers: {
    init(
      state,
      action: PayloadAction<{
        elements: QuizInitElement[]
        mode: QuizMode
      }>,
    ) {
      console.log(
        '[QuizSlice] INIT mode: ',
        action.payload.mode,
        'elements: ',
        action.payload.elements.length,
        ' assignments: ',
        action.payload?.elements?.length,
      )
      if (action.payload.elements.length === 0) return

      const readingTasks: QuizTask[] = []
      const meaningTasks: QuizTask[] = []

      const createTasksFor = (element: QuizInitElement) => {
        const isReadingTaskRequired = (element: QuizInitElement): boolean =>
          element.subjectType === 'vocabulary' ||
          element.subjectType === 'kanji'

        if (isReadingTaskRequired(element)) {
          readingTasks.push(createTask(element, 'reading'))
        }
        meaningTasks.push(createTask(element, 'meaning'))
      }

      // Shuffle subjects so that we have radicals kanji and vocabulary mixed
      const shuffledElements = _.shuffle(action.payload.elements)
      for (const el of shuffledElements) {
        createTasksFor(el)
      }

      const newState = Object.assign({}, initialState)
      // TODO: Respect user's setting of review ordering
      newState.mode = action.payload.mode
      newState.tasks = Object.fromEntries(
        meaningTasks.concat(readingTasks).map(t => [getKey(t), t]),
      )
      newState.queueState = Object.assign({}, initialQueueState, {
        readingTasks: readingTasks.map(t => ({
          subjectId: t.subjectId,
          type: t.type,
        })),
        meaningTasks: meaningTasks.map(t => ({
          subjectId: t.subjectId,
          type: t.type,
        })),
        currentQueue: readingTasks.length > 0 ? 'reading' : 'meaning',
      })
      newState.status = 'idle'
      return newState
    },
    toggleWrapUp(state) {
      state.wrapUpEnabled = !state.wrapUpEnabled
      if (!state.wrapUpEnabled) return

      const { wrapUpMeaningTasks, wrapUpReadingTasks } = getWrapUpTaskHandles(
        state.tasks,
        state.completedTasks,
        state.queueState,
      )
      state.wrapUpQueueState = Object.assign({}, initialQueueState, {
        readingTasks: wrapUpReadingTasks,
        meaningTasks: wrapUpMeaningTasks,
      })
    },
    answeredCorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const queueState = state.wrapUpEnabled
        ? state.wrapUpQueueState
        : state.queueState
      const currentTaskHanlde =
        QueueManagerHelpers.getCurrentTaskHandle(queueState)
      const currentTask = getTask(state.tasks, currentTaskHanlde)
      if (currentTask === undefined) {
        console.error('currentTask is undefined')
        return
      }
      currentTask.completed = true
      state.completedTasks.push(currentTask)
      QueueManagerHelpers.move(queueState)
    },
    answeredIncorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const queueState = state.wrapUpEnabled
        ? state.wrapUpQueueState
        : state.queueState
      const currentTaskHanlde =
        QueueManagerHelpers.getCurrentTaskHandle(queueState)
      const currentTask = getTask(state.tasks, currentTaskHanlde)
      if (currentTask === undefined) {
        console.error('currentTask is undefined')
        return
      }
      currentTask.numberOfErrors++
      QueueManagerHelpers.push(queueState)
    },
    markTaskPairAsReported(
      state,
      action: PayloadAction<{ taskPair: QuizTask[] }>,
    ) {
      const tasks = state.completedTasks.filter(
        task => task.subjectId === action.payload.taskPair[0].subjectId,
      )

      if (tasks.length === 0) {
        console.error('Can not find tasks for:', action.payload.taskPair)
        return
      }
      for (const task of tasks) {
        task.reported = true
      }
    },
  },
})

export const {
  init,
  toggleWrapUp,
  answeredCorrectly,
  answeredIncorrectly,
  markTaskPairAsReported,
} = quizSlice.actions

const getTask = (
  tasks: Record<string, QuizTask>,
  handle: QuizTaskHandle | undefined,
) => (handle ? tasks[getKey(handle)] : undefined)

const getWrapUpTaskHandles = (
  tasks: Record<string, QuizTask>,
  completedTasks: QuizTask[],
  queueState: QueueState,
) => {
  const completedSubjectIds = completedTasks.map(task => task.subjectId)
  const remainingReadingTasks =
    QueueManagerHelpers.getRemainingReadingTaskHandles(queueState)
  const remainingMeaningTasks =
    QueueManagerHelpers.getRemainingMeaningTaskHandles(queueState)
  const remainingTasks = remainingReadingTasks.concat(remainingMeaningTasks)
  const incorrectlyAnsweredSubjectIds = remainingTasks
    .map(e => getTask(tasks, e))
    .filter(e => (e?.numberOfErrors ?? 0) > 0)
    .map(e => e?.subjectId)
  const wrapUpMeaningTasks = remainingMeaningTasks.filter(
    task =>
      completedSubjectIds.includes(task.subjectId) ||
      incorrectlyAnsweredSubjectIds.includes(task.subjectId),
  )
  const wrapUpReadingTasks = remainingReadingTasks.filter(
    task =>
      completedSubjectIds.includes(task.subjectId) ||
      incorrectlyAnsweredSubjectIds.includes(task.subjectId),
  )

  return {
    wrapUpMeaningTasks,
    wrapUpReadingTasks,
  }
}

const selectActiveQueueState = createSelector(
  (state: RootState) => state.quizSlice.queueState,
  (state: RootState) => state.quizSlice.wrapUpQueueState,
  (state: RootState) => state.quizSlice.wrapUpEnabled,
  (queueState, wrapUpQueueState, wrapUpEnabled) => {
    if (wrapUpEnabled) {
      return wrapUpQueueState
    }
    return queueState
  },
)

export const selectWrapUpRemainingTaskHandles = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  (state: RootState) => state.quizSlice.completedTasks,
  (state: RootState) => state.quizSlice.queueState,
  (state: RootState) => state.quizSlice.wrapUpQueueState,
  (state: RootState) => state.quizSlice.wrapUpEnabled,
  (
    tasks: Record<string, QuizTask>,
    completedTasks: QuizTask[],
    queueState: QueueState,
    wrapUpQueueState: QueueState,
    wrapUpEnabled: boolean,
  ) => {
    if (wrapUpEnabled) {
      // Why we retrieve only meaning tasks here?
      return QueueManagerHelpers.getRemainingMeaningTaskHandles(
        wrapUpQueueState,
      )
    }
    const { wrapUpMeaningTasks, wrapUpReadingTasks } = getWrapUpTaskHandles(
      tasks,
      completedTasks,
      queueState,
    )
    return wrapUpMeaningTasks.concat(wrapUpReadingTasks)
  },
)

const selectRemainingTaskHandles = createSelector(
  selectActiveQueueState,
  (queueState: QueueState) => {
    return QueueManagerHelpers.getRemainingMeaningTaskHandles(
      queueState,
    ).concat(QueueManagerHelpers.getRemainingReadingTaskHandles(queueState))
  },
)

export const selectWrapUpEnabled = (state: RootState) =>
  state.quizSlice.wrapUpEnabled
export const selectStatus = (state: RootState) => state.quizSlice.status
export const selectProgress = createSelector(
  selectRemainingTaskHandles,
  (state: RootState) => state.quizSlice.completedTasks,
  (state: RootState) => state.quizSlice.wrapUpEnabled,
  (remainingTaskHandles, completedTasks) => {
    const completed = completedTasks.length
    const remaining = remainingTaskHandles.length
    const total = remaining + completed
    if (total === 0) return 0

    return Math.floor((completed / total) * 100)
  },
)
export const selectCurrentTask = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  selectActiveQueueState,
  (tasks, queueState): QuizTask | undefined =>
    getTask(tasks, QueueManagerHelpers.getCurrentTaskHandle(queueState)),
)
export const selectNextTask = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  selectActiveQueueState,
  (tasks, queueState): QuizTask | undefined =>
    getTask(tasks, QueueManagerHelpers.peekNextTaskHandle(queueState)),
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
        task.subjectType === 'radical' ||
        task.subjectType === 'kana_vocabulary'
      ) {
        return [task]
      }
      const answeredReadingPair = notReportedReadings.find(
        readingTask => readingTask.subjectId === task.subjectId,
      )
      if (answeredReadingPair !== undefined) {
        return [task, answeredReadingPair]
      } else {
        // The pair task is not completed yet
      }

      return undefined
    })
    return filterNotUndefined(readyForReportPairs)
  },
)

export const selectCompletedTaskPair = (task: QuizTask) =>
  createSelector(
    (state: RootState) => state.quizSlice.completedTasks,
    (tasks): QuizTask | undefined | false => {
      if (task.type === 'meaning') {
        if (
          task.subjectType === 'radical' ||
          task.subjectType === 'kana_vocabulary'
        ) {
          return false
        }

        const readingTask = tasks.find(
          readingTask =>
            readingTask.subjectId === task.subjectId &&
            readingTask.type === 'reading',
        )

        return readingTask
      } else {
        // This is reading task. Look for meaning pair
        const meaningTask = tasks.find(
          meaningTask =>
            meaningTask.subjectId === task.subjectId &&
            meaningTask.type === 'meaning',
        )

        return meaningTask
      }
    },
  )

export default quizSlice.reducer
