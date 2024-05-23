import { Kanji } from '@/src/types/kanji'
import { SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { FlatList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import CustomTagRenderer from '@/src/components/CustomRenderer/Index'
import typography from '@/src/constants/typography'
import { Hint } from './Hint'
import { ReadingView } from './ReadingView'
import { Reading } from '@/src/types/reading'

type Props = {
  subject: Vocabulary | Kanji
}

export const ReadingPage = ({ subject }: Props) => {
  return SubjectUtils.isKanji(subject)
    ? KanjiPage({ subject })
    : VocabularyPage({ subject })
}

type VocabularyProps = {
  subject: Vocabulary
}

export const VocabularyPage = ({ subject }: VocabularyProps) => {
  const { styles } = useStyles(stylesheet)

  console.log('\n\nPRONON', subject.pronunciation_audios)
  const getAudio = (reading: Reading) =>
    SubjectUtils.getPrononciationAudioForReading(subject, reading)

  console.log('\n\nMNEMONIC: ', subject.reading_mnemonic)

  return (
    <Page>
      <PageSection title='Vocab Reading'>
        <FlatList
          scrollEnabled={false}
          style={styles.flatList}
          data={subject.readings}
          renderItem={el => (
            <ReadingView
              reading={el.item}
              pronunciation_audios={getAudio(el.item)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={styles.flatListSeparator} />
          )}
        />
      </PageSection>
      <View style={{ height: 16 }} />
      <PageSection title='Reading Explanation'>
        <CustomTagRenderer style={styles.explanation}>
          {subject.reading_mnemonic}
        </CustomTagRenderer>
      </PageSection>
    </Page>
  )
}

type KanjiProps = {
  subject: Kanji
}

export const KanjiPage = ({ subject }: KanjiProps) => {
  const { styles } = useStyles(stylesheet)

  return (
    <Page>
      <PageSection title='Meaning Mnemonic'>
        <CustomTagRenderer style={styles.explanation}>
          {subject.meaning_mnemonic}
        </CustomTagRenderer>
        <View style={{ height: 16 }} />
        <Hint>{subject.meaning_hint}</Hint>
      </PageSection>
    </Page>
  )
}

const stylesheet = createStyleSheet({
  flatList: {
    flexGrow: 0,
  },
  flatListSeparator: {
    width: 24,
  },
  explanation: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.4,
  },
})
