import { PronunciationAudio } from '@/src/types/pronunciationAudio'
import { Reading } from '@/src/types/reading'
import { FlatList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { PronunciationAudioView } from './PronunciationAudioView'
import typography from '@/src/constants/typography'
import { Fragment } from 'react'

type Props = {
  reading: Reading
  showType?: boolean
  pronunciation_audios: PronunciationAudio[]
}

export const ReadingView = ({
  reading,
  showType = false,
  pronunciation_audios,
}: Props) => {
  const { styles } = useStyles(stylesheet)
  const pronunciation_audios_supported = pronunciation_audios.filter(
    el => el.content_type !== 'audio/webm',
  )

  return (
    <View>
      <Text style={styles.readingText}>{reading.reading}</Text>
      {pronunciation_audios_supported.length > 0 && (
        <Fragment>
          <View style={{ height: 12 }} />
          <FlatList
            style={styles.flatList}
            data={pronunciation_audios_supported}
            renderItem={el => (
              <PronunciationAudioView pronunciation_audio={el.item} />
            )}
            ItemSeparatorComponent={() => (
              <View style={styles.flatListSeparator} />
            )}
          />
        </Fragment>
      )}
    </View>
  )
}

const stylesheet = createStyleSheet({
  readingText: {
    ...typography.titleC,
  },
  flatList: {
    flexGrow: 0,
    alignItems: 'flex-start',
  },
  flatListSeparator: {
    height: 8,
  },
})
