import {
  QueueManagerHelpers,
  initialQueueState,
  QueueState,
  TASKS_IN_A_ROW_THRESHOLD,
} from '@/src/utils/QueueManager'
import { QuizTask } from '@/src/types/quizTask'
import { TaskType } from '@/src/types/quizTaskType'

const createTask = (type: TaskType, subjectId: number): QuizTask => ({
  subjectId: subjectId,
  subjectType: 'kanji',
  type: type,
  numberOfErrors: 0,
  completed: false,
  reported: false,
})

describe('QueueManagerHelpers', () => {
  let state: QueueState
  let readingTasks: QuizTask[]
  let meaningTasks: QuizTask[]

  beforeEach(() => {
    readingTasks = Array.from({ length: 10 }, (_, i) =>
      createTask('reading', i + 1),
    )

    meaningTasks = Array.from({ length: 10 }, (_, i) =>
      createTask('meaning', i + 1),
    )

    state = {
      ...initialQueueState,
      readingTasks: [...readingTasks],
      meaningTasks: [...meaningTasks],
      currentQueue: 'reading',
      readingIndex: 1,
      meaningIndex: 3,
      tasksInARow: 0,
    }
  })

  describe('getCurrentTask', () => {
    it('returns the current reading task when currentQueue is reading', () => {
      state.currentQueue = 'reading'
      const task = QueueManagerHelpers.getCurrentTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.readingTasks[1])
      expect(task?.type).toBe('reading')
    })

    it('returns the current meaning task when currentQueue is meaning', () => {
      state.currentQueue = 'meaning'
      const task = QueueManagerHelpers.getCurrentTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.meaningTasks[3])
      expect(task?.type).toBe('meaning')
    })

    it('returns undefined if no tasks are available for the current queue', () => {
      state.currentQueue = 'reading'
      state.readingTasks = []
      const task = QueueManagerHelpers.getCurrentTask(state)
      expect(task).toBeUndefined()
    })
  })

  describe('peekNextTask', () => {
    it('returns the next reading task when currentQueue is reading', () => {
      state.currentQueue = 'reading'
      const task = QueueManagerHelpers.peekNextTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.readingTasks[2])
    })

    it('returns the next meaning task when currentQueue is meaning', () => {
      state.currentQueue = 'meaning'
      const task = QueueManagerHelpers.peekNextTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.meaningTasks[4])
    })

    it('returns undefined if there is no next task', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 9
      state.meaningIndex = 10
      const task = QueueManagerHelpers.peekNextTask(state)
      expect(task).toBeUndefined()
    })

    it('returns the next meaning task when currentQueue is reading and it we are on the last task', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 9
      const task = QueueManagerHelpers.peekNextTask(state)
      const expected = state.meaningTasks[state.meaningIndex]
      expect(task).toBe(expected)
    })
  })

  describe('getRemainingReadingTasks', () => {
    it('returns the slice of reading tasks from the current readingIndex', () => {
      state.currentQueue = 'reading'
      const remaining = QueueManagerHelpers.getRemainingReadingTasks(state)
      expect(remaining.length).toBe(9)
      expect(remaining[0]).toBe(state.readingTasks[1])
      expect(remaining[8]).toBe(state.readingTasks[9])
    })

    it('returns all reading tasks if readingIndex is 0', () => {
      state.readingIndex = 0
      state.currentQueue = 'reading'
      const remaining = QueueManagerHelpers.getRemainingReadingTasks(state)
      expect(remaining.length).toBe(10)
    })

    it('returns an empty array if readingIndex is beyond the number of tasks', () => {
      state.readingIndex = 10
      state.currentQueue = 'reading'
      const remaining = QueueManagerHelpers.getRemainingReadingTasks(state)
      expect(remaining.length).toBe(0)
    })
  })

  describe('getRemainingMeaningTasks', () => {
    it('returns the slice of meaning tasks from the current meaningIndex', () => {
      state.currentQueue = 'meaning'
      const remaining = QueueManagerHelpers.getRemainingMeaningTasks(state)
      expect(remaining.length).toBe(7)
      expect(remaining[0].subjectId).toBe(state.meaningTasks[3].subjectId)
      expect(remaining[6].subjectId).toBe(state.meaningTasks[9].subjectId)
    })

    it('returns all meaning tasks if meaningIndex is 0', () => {
      state.meaningIndex = 0
      state.currentQueue = 'meaning'
      const remaining = QueueManagerHelpers.getRemainingMeaningTasks(state)
      expect(remaining.length).toBe(10)
    })

    it('returns an empty array if meaningIndex is beyond the number of tasks', () => {
      state.meaningIndex = 10
      state.currentQueue = 'meaning'
      const remaining = QueueManagerHelpers.getRemainingMeaningTasks(state)
      expect(remaining.length).toBe(0)
    })
  })

  describe('move', () => {
    it('increments readingIndex when currentQueue is reading', () => {
      state.currentQueue = 'reading'
      QueueManagerHelpers.move(state)
      expect(state.readingIndex).toBe(2)
      expect(state.meaningIndex).toBe(3)
      expect(state.tasksInARow).toBe(1)
    })

    it('increments meaningIndex when currentQueue is meaning', () => {
      state.currentQueue = 'meaning'
      QueueManagerHelpers.move(state)
      expect(state.meaningIndex).toBe(4)
      expect(state.readingIndex).toBe(1)
      expect(state.tasksInARow).toBe(1)
    })

    it('switches queues if needed (e.g., after TASKS_IN_A_ROW_THRESHOLD)', () => {
      state.tasksInARow = TASKS_IN_A_ROW_THRESHOLD
      state.currentQueue = 'reading'
      state.readingIndex = 9
      QueueManagerHelpers.move(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0)
    })
  })

  describe('push', () => {
    it('re-inserts the current reading task further down the reading queue', () => {
      state.currentQueue = 'reading'
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(2)

      QueueManagerHelpers.push(state)
      expect(state.readingTasks.map(t => t.subjectId)).toEqual([
        1, 3, 4, 5, 6, 7, 2, 8, 9, 10,
      ])
      expect(state.tasksInARow).toBe(1)
    })

    it('re-inserts the current meaning task further down the meaning queue', () => {
      state.currentQueue = 'meaning'
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(4)

      QueueManagerHelpers.push(state)
      expect(state.meaningTasks.map(t => t.subjectId)).toEqual([
        1, 2, 3, 5, 6, 7, 8, 9, 4, 10,
      ])
      expect(state.tasksInARow).toBe(1)
    })

    it('re-inserts the current meaning task at the end of meaning queue when there are less than PUSH_DISTANCE tasks left', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 7
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(8)

      QueueManagerHelpers.push(state)
      expect(state.meaningTasks.map(t => t.subjectId)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 9, 10, 8,
      ])
      expect(state.tasksInARow).toBe(1)
    })

    it('re-inserts the current meaning task at the end of meaning queue when is only one task and switches the queue', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 9
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(10)

      QueueManagerHelpers.push(state)
      expect(state.meaningTasks.map(t => t.subjectId)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
      expect(state.tasksInARow).toBe(0)
      expect(state.currentQueue).toBe('reading')
    })

    it('re-inserts the current meaning task at the end of meaning queue when is only one task and does not switch the queue to the empty one', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 9
      state.readingIndex = readingTasks.length
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(10)

      QueueManagerHelpers.push(state)
      expect(state.meaningTasks.map(t => t.subjectId)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
      expect(state.currentQueue).toBe('meaning')
    })
  })

  describe('shouldSwitchQueue and switchQueue', () => {
    it('switches from reading to meaning if reading tasks are completed', () => {
      state.currentQueue = 'reading'
      state.readingIndex = readingTasks.length
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeTruthy()
      QueueManagerHelpers.switchQueue(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0)
    })

    it('switches from meaning to reading if meaning tasks are completed', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = meaningTasks.length
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeTruthy()
      QueueManagerHelpers.switchQueue(state)
      expect(state.currentQueue).toBe('reading')
      expect(state.tasksInARow).toBe(0)
    })

    it('switches if tasksInARow > TASKS_IN_A_ROW_THRESHOLD', () => {
      state.tasksInARow = TASKS_IN_A_ROW_THRESHOLD + 1
      state.currentQueue = 'reading'
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeTruthy()
      QueueManagerHelpers.switchQueue(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0)
    })

    it('does not switch if tasks in a row is less than the threshold', () => {
      state.currentQueue = 'reading'
      state.tasksInARow = 1
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeFalsy()
    })

    it('does not switch after switching ones on queue completion', () => {
      state.currentQueue = 'reading'
      state.tasksInARow = readingTasks.length
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeTruthy()
      QueueManagerHelpers.switchQueue(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0)
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeFalsy()
    })

    it('does not switch if there are no elements in other queue', () => {
      state.currentQueue = 'reading'
      state.meaningIndex = meaningTasks.length
      state.tasksInARow = readingTasks.length
      expect(QueueManagerHelpers.shouldSwitchQueue(state)).toBeFalsy()
    })
  })
})
