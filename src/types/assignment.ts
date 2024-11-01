import { Colors } from '../constants/Colors'

const srsStageNames = [
  'Initiate',
  'Apprentice I',
  'Apprentice II',
  'Apprentice III',
  'Apprentice IV',
  'Guru I',
  'Guru II',
  'Master',
  'Enlightened',
  'Burned',
] as const

export type srsStageMilestone =
  | 'Apprentice'
  | 'Guru'
  | 'Master'
  | 'Enlightened'
  | 'Burned'

export type SRSStageName = (typeof srsStageNames)[number]

export const srsStageToName = (
  srsStage: number | undefined,
): SRSStageName | undefined =>
  srsStage !== undefined ? srsStageNames[srsStage] : undefined

export const srsStageToMilestone = (
  srsStage: number | undefined,
): srsStageMilestone | undefined => {
  if (srsStage === undefined) return undefined

  if (srsStage === 9) return 'Burned'
  else if (srsStage === 8) return 'Enlightened'
  else if (srsStage === 7) return 'Master'
  else if (srsStage >= 5) return 'Guru'
  else if (srsStage >= 1) return 'Apprentice'
  else return undefined
}

export const srsStageToColor = (
  srsStage: number | undefined,
): string | undefined => {
  if (srsStage === undefined) return undefined

  if (srsStage === 9) return Colors.burnedBlack
  else if (srsStage === 8) return Colors.enlightenedBlue
  else if (srsStage === 7) return Colors.masterBlue
  else if (srsStage >= 5) return Colors.guruPurple
  else if (srsStage >= 1) return Colors.apprenticePink
  else return undefined
}

export interface Assignment {
  id: number
  updated_at: number // Timestamp when the assignment was last updated

  available_at: number | null // Timestamp when the related subject will be available in the user's review queue
  burned_at: number | null // Timestamp when the user reaches SRS stage 9 the first time
  created_at: number // Timestamp when the assignment was created
  hidden: boolean // Indicates if the associated subject has been hidden
  passed_at: number | null // Timestamp when the user reaches SRS stage 5 for the first time
  resurrected_at: number | null // Timestamp when the subject is resurrected
  srs_stage: number // The current SRS stage interval
  started_at: number | null // Timestamp when the user completes the lesson
  subject_id: number // Unique identifier of the associated subject
  subject_type: 'kana_vocabulary' | 'kanji' | 'radical' | 'vocabulary' // The type of the associated subject
  unlocked_at: number | null // Timestamp when the related subject is made available in lessons
}
