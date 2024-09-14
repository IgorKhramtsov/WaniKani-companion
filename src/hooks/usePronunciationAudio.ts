import { Audio } from 'expo-av'
import { useQuery } from '@tanstack/react-query'
import { PronunciationAudio } from '../types/pronunciationAudio'
import { useCallback, useEffect } from 'react'

export const usePronunciationAudio = (
  audio: PronunciationAudio | undefined,
) => {
  const sound = useQuery({
    queryKey: [audio?.url],
    queryFn: () =>
      audio?.url
        ? Audio.Sound.createAsync({ uri: audio?.url }, { shouldPlay: false })
        : Promise.reject(),
    enabled: !!audio,
  })

  const playSound = useCallback(async () => {
    if (!sound?.data) return

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
      await sound.data?.sound.replayAsync()
    } catch (reason) {
      console.error(reason)
    }
  }, [sound?.data])

  useEffect(() => {
    return sound.data
      ? () => {
          sound.data?.sound.unloadAsync()
        }
      : undefined
  }, [sound.data])

  return { playSound, isLoading: sound.isLoading }
}
