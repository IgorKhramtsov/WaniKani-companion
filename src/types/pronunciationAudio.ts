import { random } from 'lodash'
import { VoiceType } from './localSettings'

export const getPreferedAudio = (
  audios: PronunciationAudio[],
  defaultVoice: VoiceType | undefined,
): PronunciationAudio | undefined => {
  // Webm is not supported on iOS
  const supportetAudios = audios.filter(e => e.content_type !== 'audio/webm')
  switch (defaultVoice) {
    case 'feminine_only':
      return supportetAudios.find(audio => audio.metadata.gender === 'female')
    case 'masculine_only':
      return supportetAudios.find(audio => audio.metadata.gender === 'male')
    case 'prefer_feminine':
      return (
        supportetAudios.find(audio => audio.metadata.gender === 'female') ??
        supportetAudios[0]
      )
    case 'prefer_masculine':
      return (
        supportetAudios.find(audio => audio.metadata.gender === 'female') ??
        supportetAudios[0]
      )
    default:
      return (
        supportetAudios[random(supportetAudios.length - 1)] ??
        supportetAudios[0]
      )
  }
}

/**
 * Represents pronunciation audio for a vocabulary or kana vocabulary subject.
 */
export interface PronunciationAudio {
  /**
   * The location of the audio.
   */
  url: string

  /**
   * The content type of the audio. Currently the API delivers audio/mpeg and audio/ogg.
   */
  content_type: 'audio/mpeg' | 'audio/ogg' | 'audio/webm'

  /**
   * Details about the pronunciation audio.
   */
  metadata: {
    /**
     * The gender of the voice actor.
     */
    gender: 'male' | 'female'

    /**
     * A unique ID shared between the same source pronunciation audio.
     */
    source_id: number

    /**
     * Vocabulary being pronounced in kana.
     */
    pronunciation: string

    /**
     * A unique ID belonging to the voice actor.
     */
    voice_actor_id: number

    /**
     * Humanized name of the voice actor.
     */
    voice_actor_name: string

    /**
     * Description of the voice.
     */
    voice_description: string
  }
}
