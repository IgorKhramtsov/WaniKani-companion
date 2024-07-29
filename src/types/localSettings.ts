export const voiceTypeStrings = [
  'feminine_only',
  'masculine_only',
  'prefer_feminine',
  'prefer_masculine',
  'random',
] as const
export type VoiceType = (typeof voiceTypeStrings)[number]

interface DebugSettings {
  debug_mode_enabled: boolean
}

interface Settings {
  max_lessons_per_day: number
  default_voice: VoiceType
  interleave_advanced_lessons: boolean
}

export type LocalSettings = Settings & DebugSettings

export const localSettingsDefautlValue: LocalSettings = {
  debug_mode_enabled: false,

  max_lessons_per_day: 15,
  default_voice: 'random',
  interleave_advanced_lessons: true,
}
