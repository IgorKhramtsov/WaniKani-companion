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

interface BaseProps {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

interface Props extends BaseProps {
  subject: Vocabulary | Kanji
}

export const ReadingPage = ({ subject, ...args }: Props) => {
  return SubjectUtils.isKanji(subject)
    ? KanjiPage({ subject, ...args })
    : VocabularyPage({ subject, ...args })
}

interface VocabularyProps extends BaseProps {
  subject: Vocabulary
}

export const VocabularyPage = ({
  subject,
  topContent,
  bottomContent,
}: VocabularyProps) => {
  const { styles } = useStyles(stylesheet)

  // console.log('\n\nPRONON', subject.pronunciation_audios)
  const getAudio = (reading: Reading) =>
    SubjectUtils.getPrononciationAudioForReading(subject, reading)

  // console.log('\n\nMNEMONIC: ', subject.reading_mnemonic)

  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
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

interface KanjiProps extends BaseProps {
  subject: Kanji
}

export const KanjiPage = ({
  subject,
  topContent,
  bottomContent,
}: KanjiProps) => {
  const { styles } = useStyles(stylesheet)

  const primaryReadings = SubjectUtils.getPrimaryReadings(subject)

  // TODO: add mapping for reading type (it should be on'youmi instead of
  // onyomi)
  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
      <PageSection title={`Readings (${primaryReadings[0]?.type})`}>
        <Text style={styles.readingText}>
          {primaryReadings.map(e => e.reading).join(', ')}
        </Text>
      </PageSection>
      <View style={{ height: 16 }} />
      <PageSection title='Reading Mnemonic'>
        <CustomTagRenderer style={styles.explanation}>
          {subject.reading_mnemonic}
        </CustomTagRenderer>
        {subject.reading_hint && (
          <View>
            <View style={{ height: 16 }} />
            <Hint>{subject.reading_hint}</Hint>
          </View>
        )}
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
  readingText: {
    ...typography.titleC,
  },
  explanation: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.4,
  },
})
