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
    readingTasks = [
      createTask('reading', 1),
      createTask('reading', 2),
      createTask('reading', 3),
    ]

    meaningTasks = [
      createTask('meaning', 1),
      createTask('meaning', 2),
      createTask('meaning', 3),
    ]

    state = {
      ...initialQueueState,
      readingTasks: [...readingTasks],
      meaningTasks: [...meaningTasks],
      currentQueue: 'reading',
      readingIndex: 0,
      meaningIndex: 0,
      tasksInARow: 0,
    }
  })

  describe('getCurrentTask', () => {
    it('returns the current reading task when currentQueue is reading', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 0
      const task = QueueManagerHelpers.getCurrentTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.readingTasks[0])
      expect(task?.type).toBe('reading')
    })

    it('returns the current meaning task when currentQueue is meaning', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 0
      const task = QueueManagerHelpers.getCurrentTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.meaningTasks[0])
      expect(task?.type).toBe('meaning')
    })

    it('returns undefined if no tasks are available for the current queue', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 0
      state.readingTasks = []
      const task = QueueManagerHelpers.getCurrentTask(state)
      expect(task).toBeUndefined()
    })
  })

  describe('peekNextTask', () => {
    it('returns the next reading task when currentQueue is reading', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 0
      const task = QueueManagerHelpers.peekNextTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.readingTasks[1])
    })

    it('returns the next meaning task when currentQueue is meaning', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 0
      const task = QueueManagerHelpers.peekNextTask(state)
      expect(task).toBeDefined()
      expect(task).toBe(state.meaningTasks[1])
    })

    it('returns undefined if there is no next task', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 2
      const task = QueueManagerHelpers.peekNextTask(state)
      expect(task).toBeUndefined()
    })
  })

  describe('getRemainingReadingTasks', () => {
    it('returns the slice of reading tasks from the current readingIndex', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 1
      const remaining = QueueManagerHelpers.getRemainingReadingTasks(state)
      expect(remaining.length).toBe(2)
      expect(remaining[0]).toBe(state.readingTasks[1])
      expect(remaining[1]).toBe(state.readingTasks[2])
    })

    it('returns all reading tasks if readingIndex is 0', () => {
      state.readingIndex = 0
      state.currentQueue = 'reading'
      const remaining = QueueManagerHelpers.getRemainingReadingTasks(state)
      expect(remaining.length).toBe(3)
    })

    it('returns an empty array if readingIndex is beyond the number of tasks', () => {
      state.readingIndex = 3
      state.currentQueue = 'reading'
      const remaining = QueueManagerHelpers.getRemainingReadingTasks(state)
      expect(remaining.length).toBe(0)
    })
  })

  describe('getRemainingMeaningTasks', () => {
    it('returns the slice of meaning tasks from the current meaningIndex', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 1
      const remaining = QueueManagerHelpers.getRemainingMeaningTasks(state)
      expect(remaining.length).toBe(2)
      expect(remaining[0].subjectId).toBe(state.meaningTasks[1].subjectId)
      expect(remaining[1].subjectId).toBe(state.meaningTasks[2].subjectId)
    })

    it('returns all meaning tasks if meaningIndex is 0', () => {
      state.meaningIndex = 0
      state.currentQueue = 'meaning'
      const remaining = QueueManagerHelpers.getRemainingMeaningTasks(state)
      expect(remaining.length).toBe(3)
    })

    it('returns an empty array if meaningIndex is beyond the number of tasks', () => {
      state.meaningIndex = 3
      state.currentQueue = 'meaning'
      const remaining = QueueManagerHelpers.getRemainingMeaningTasks(state)
      expect(remaining.length).toBe(0)
    })
  })

  describe('move', () => {
    it('increments readingIndex when currentQueue is reading', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 0
      QueueManagerHelpers.move(state)
      expect(state.readingIndex).toBe(1)
      expect(state.meaningIndex).toBe(0)
      expect(state.tasksInARow).toBe(1)
    })

    it('increments meaningIndex when currentQueue is meaning', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = 0
      QueueManagerHelpers.move(state)
      expect(state.meaningIndex).toBe(1)
      expect(state.readingIndex).toBe(0)
      expect(state.tasksInARow).toBe(1)
    })

    it('switches queues if needed (e.g., after TASKS_IN_A_ROW_THRESHOLD)', () => {
      // Simulate hitting the threshold
      state.tasksInARow = TASKS_IN_A_ROW_THRESHOLD
      state.currentQueue = 'reading'
      state.readingIndex = 2
      // readingTasks length = 3, so after increment, readingIndex = 3
      // That means reading tasks are completed, queue should switch
      QueueManagerHelpers.move(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0) // reset after switch
    })
  })

  describe('push', () => {
    it('re-inserts the current reading task further down the reading queue', () => {
      state.currentQueue = 'reading'
      state.readingIndex = 0
      state.meaningIndex = 1
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(1)

      QueueManagerHelpers.push(state)
      // After push:
      // The current task (subjectId=1) should be moved 5 positions ahead or near the end if less than 5 remain.
      // Since we only have 3 tasks total, pushing by 5 effectively puts it at the end.
      // The queue now should look like: [2, 3, 1]
      expect(state.readingTasks.map(t => t.subjectId)).toEqual([2, 3, 1])

      // tasksInARow increments by 1
      expect(state.tasksInARow).toBe(1)
    })

    it('re-inserts the current meaning task further down the meaning queue', () => {
      state.currentQueue = 'meaning'
      state.readingIndex = 1
      state.meaningIndex = 0
      const currentTask = QueueManagerHelpers.getCurrentTask(state)
      expect(currentTask?.subjectId).toBe(1)

      QueueManagerHelpers.push(state)
      expect(state.meaningTasks.map(t => t.subjectId)).toEqual([2, 3, 1])
      expect(state.tasksInARow).toBe(1)
    })
  })

  describe('switchQueueIfNeeded', () => {
    it('switches from reading to meaning if reading tasks are completed', () => {
      state.currentQueue = 'reading'
      state.readingIndex = readingTasks.length // beyond the number of reading tasks (3 tasks, index now out of range)
      QueueManagerHelpers.switchQueueIfNeeded(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0)
    })

    it('switches from meaning to reading if meaning tasks are completed', () => {
      state.currentQueue = 'meaning'
      state.meaningIndex = meaningTasks.length // all meaning tasks done
      QueueManagerHelpers.switchQueueIfNeeded(state)
      expect(state.currentQueue).toBe('reading')
      expect(state.tasksInARow).toBe(0)
    })

    it('switches if tasksInARow > TASKS_IN_A_ROW_THRESHOLD', () => {
      state.tasksInARow = TASKS_IN_A_ROW_THRESHOLD + 1 // threshold is 8
      state.currentQueue = 'reading'
      QueueManagerHelpers.switchQueueIfNeeded(state)
      expect(state.currentQueue).toBe('meaning')
      expect(state.tasksInARow).toBe(0)
    })

    it('does not switch if conditions are not met', () => {
      state.currentQueue = 'reading'
      state.tasksInARow = 1
      state.readingIndex = 1
      state.meaningIndex = 0
      QueueManagerHelpers.switchQueueIfNeeded(state)
      expect(state.currentQueue).toBe('reading')
      expect(state.tasksInARow).toBe(1)
    })
  })
})
