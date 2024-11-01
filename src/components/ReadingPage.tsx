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
import {
  Reading,
  readingTypeStrings,
  toNiceEmphasis,
} from '@/src/types/reading'
import { Fragment } from 'react'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'
import * as wanakana from 'wanakana'
import { isKatakanaPresent } from '../utils/kanaUtils'
import { SubjectUserReadingHint } from './SubjectUserHint'

interface PageProps {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

type BaseProps = {
  variant?: 'extended' | 'normal'
}

type Props = BaseProps & {
  subject: Vocabulary | Kanji
}

export const ReadingPage = ({
  topContent,
  bottomContent,
  ...props
}: Props & PageProps) => {
  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
      <ReadingSection {...props} />
    </Page>
  )
}

export const ReadingSection = ({
  subject,
  variant = 'normal',
  ...props
}: Props) => {
  return SubjectUtils.isKanji(subject)
    ? KanjiSection({ subject, variant, ...props })
    : VocabularySection({ subject, variant, ...props })
}

type VocabularyProps = BaseProps & {
  subject: Vocabulary
}

export const VocabularySection = ({ subject }: VocabularyProps) => {
  const { styles } = useStyles(stylesheet)

  const getAudio = (reading: Reading) =>
    SubjectUtils.getPrononciationAudioForReading(subject, reading)
  // Sort readings in such way so that katakana twin (if present) is shown
  // first, so that they are 'grouped' together before the audio
  const sortedReadings = [...subject.readings].sort((a, b) => {
    if (
      wanakana.toHiragana(a.reading, { convertLongVowelMark: false }) ===
      wanakana.toHiragana(b.reading, { convertLongVowelMark: false })
    ) {
      return isKatakanaPresent(a.reading) ? -1 : 1
    }
    return 0
  })

  return (
    <Fragment>
      <PageSection title='Vocab Reading'>
        <FlatList
          scrollEnabled={false}
          style={styles.flatList}
          data={sortedReadings}
          renderItem={el => (
            <ReadingView
              key={el.item.reading}
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
      <View style={{ height: 8 }} />
      <SubjectUserReadingHint subjectId={subject.id} />
    </Fragment>
  )
}

type KanjiProps = BaseProps & {
  subject: Kanji
}

export const KanjiSection = ({ subject, variant }: KanjiProps) => {
  const { styles } = useStyles(stylesheet)

  const primaryReadings = SubjectUtils.getPrimaryReadings(subject)
  const primaryReadingType = primaryReadings[0].type
  const readingsByType = SubjectUtils.getReadingsByType(subject)

  const readingNode = (() => {
    if (variant === 'extended') {
      return (
        <PageSection title={`Readings`}>
          <View style={styles.readingsRow}>
            {readingTypeStrings.map(type => {
              const readings = readingsByType[type]
                .filter((e): e is Reading => e !== undefined)
                .map(e => e.reading)
              const textColor =
                primaryReadingType === type ? Colors.black : Colors.gray88
              return (
                <View
                  key={type}
                  style={{
                    padding: 4,
                    paddingHorizontal: 8,
                    minWidth: `${100 / readingTypeStrings.length}%`,
                  }}>
                  <Text style={[styles.readingType, { color: textColor }]}>
                    {toNiceEmphasis(type)}
                  </Text>
                  <View style={{ height: 4 }} />
                  <Text style={[styles.readingText, { color: textColor }]}>
                    {readings.length > 0 ? readings.join(', ') : '--'}
                  </Text>
                </View>
              )
            })}
          </View>
        </PageSection>
      )
    } else {
      const readingType = primaryReadings[0]?.type
      if (!readingType) {
        console.warn('No reading type found for kanji', subject)
      }
      const title = readingType
        ? `Readings (${toNiceEmphasis(readingType)})`
        : 'Reading'
      return (
        <PageSection title={title}>
          <Text style={styles.readingText}>
            {primaryReadings.map(e => e.reading).join(', ')}
          </Text>
        </PageSection>
      )
    }
  })()

  return (
    <Fragment>
      {readingNode}
      <View style={{ height: 16 }} />
      <PageSection title='Reading Mnemonic'>
        <CustomTagRenderer style={styles.explanation}>
          {subject.reading_mnemonic}
        </CustomTagRenderer>
        <View style={{ height: 8 }} />
        <SubjectUserReadingHint subjectId={subject.id} />
        {subject.reading_hint && (
          <View>
            <View style={{ height: 16 }} />
            <Hint>{subject.reading_hint}</Hint>
          </View>
        )}
      </PageSection>
    </Fragment>
  )
}

const stylesheet = createStyleSheet({
  flatList: {
    flexGrow: 0,
  },
  flatListSeparator: {
    width: 24,
  },
  readingsRow: {
    ...appStyles.row,
    flexWrap: 'wrap',
  },
  readingType: {
    ...typography.overline,
    fontWeight: '300',
  },
  readingText: {
    ...typography.titleC,
    fontWeight: '300',
  },
  explanation: {
    ...typography.body,
    fontWeight: '300',
  },
})
