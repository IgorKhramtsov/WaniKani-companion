export const voiceTypeStrings = [
  'feminine_only',
  'masculine_only',
  'prefer_feminine',
  'prefer_masculine',
  'random',
] as const
export type VoiceType = (typeof voiceTypeStrings)[number]

export interface LocalSettings {
  max_lessons_per_day: number
  default_voice: VoiceType
  interleave_advanced_lessons: boolean
}

export const localSettingsDefautlValue: LocalSettings = {
  max_lessons_per_day: 15,
  default_voice: 'random',
  interleave_advanced_lessons: true,
}
