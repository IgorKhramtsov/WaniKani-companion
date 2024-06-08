import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { PronunciationAudio } from '@/src/types/pronunciationAudio'
import { AntDesign } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import Waveform from '@/assets/images/waveform_short.svg'

export const PronunciationAudioView = ({
  pronunciation_audio,
}: {
  pronunciation_audio: PronunciationAudio
}) => {
  const { styles } = useStyles(stylesheet)
  const [sound, setSound] = useState<Audio.Sound>()

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: pronunciation_audio.url },
        { shouldPlay: true },
      )
      setSound(sound)

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
      await sound.playAsync()
    } catch (reason) {
      console.log(reason)
    }
  }
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound')
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  const image =
    pronunciation_audio.metadata.gender === 'female'
      ? require('@/assets/images/woman.png')
      : require('@/assets/images/man.png')

  return (
    <View style={styles.voiceViewWithAvatar}>
      <Image source={image} style={styles.avatar} />
      <View style={{ width: 8 }} />

      <View style={styles.voiceView}>
        <View style={appStyles.row}>
          <Text style={styles.voiceActorName}>
            {pronunciation_audio.metadata.voice_actor_name}
          </Text>
          <View style={{ width: 4 }} />
          <Text style={styles.voiceDesc}>
            ({pronunciation_audio.metadata.voice_description})
          </Text>
        </View>
        <View style={{ height: 4 }} />
        <Pressable onPress={playSound} style={styles.voicePlayer}>
          <AntDesign name='playcircleo' size={24} color='black' />
          <View style={{ width: 8 }} />
          <Waveform width={140} height={30} />
        </Pressable>
      </View>
    </View>
  )
}

const stylesheet = createStyleSheet({
  flatList: {
    flexGrow: 0,
    alignItems: 'flex-start',
  },
  flatListSeparator: {
    height: 8,
  },
  voiceViewWithAvatar: {
    ...appStyles.row,
    alignItems: 'flex-end',
  },
  voicePlayer: {
    ...appStyles.row,
  },
  voiceView: {
    borderRadius: 8,
    backgroundColor: Colors.generalGray,
    padding: 8,
    paddingHorizontal: 16,
  },
  voiceActorName: {
    ...typography.label,
  },
  voiceDesc: {
    ...typography.caption,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 100,
    marginBottom: 4,
  },
  chartContainer: {
    width: 200,
    alignItems: 'center',
  },
  candle: {
    backgroundColor: 'orange',
  },
})
