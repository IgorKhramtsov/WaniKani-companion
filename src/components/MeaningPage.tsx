import { Kanji } from '@/src/types/kanji'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import CustomTagRenderer from '@/src/components/CustomRenderer/Index'
import typography from '@/src/constants/typography'
import { Hint } from './Hint'
import { Radical } from '@/src/types/radical'
import { KanaVocabulary } from '@/src/types/kanaVocabulary'
import { Fragment } from 'react'

interface BaseProps {
  /*
   * whether to show the meaning (for review card)
   */
  showMeaning?: boolean
  showOtherMeanings?: boolean
}

interface Props extends BaseProps {
  subject: Subject
}

interface PageProps {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

export const MeaningPage = ({
  subject,
  topContent,
  bottomContent,
  ...props
}: Props & PageProps) => {
  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
      <MeaningSection subject={subject} {...props} />
    </Page>
  )
}

export const MeaningSection = ({ subject, ...props }: Props) => {
  if (SubjectUtils.isKanji(subject)) {
    return KanjiSection({ subject, ...props })
  } else if (
    SubjectUtils.isVocabulary(subject) ||
    SubjectUtils.isKanaVocabulary(subject)
  ) {
    return VocabularySection({ subject, ...props })
  } else if (SubjectUtils.isRadical(subject)) {
    return RadicalSection({ subject, ...props })
  } else {
    return <Text>unknown subject</Text>
  }
}

interface VocabularyProps extends BaseProps {
  subject: Vocabulary | KanaVocabulary
}

export const VocabularySection = ({
  subject,
  showMeaning,
  showOtherMeanings = true,
}: VocabularyProps) => {
  const { styles } = useStyles(stylesheet)

  const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)?.meaning
  const otherMeanings = SubjectUtils.getOtherMeaning(subject).map(
    el => el.meaning,
  )

  return (
    <Fragment>
      {showMeaning && (
        <View>
          <PageSection title='Meaning'>
            <Text style={typography.body}>{primaryMeaning}</Text>
          </PageSection>
          <View style={{ height: 16 }} />
        </View>
      )}
      {showOtherMeanings && otherMeanings.length > 0 && (
        <View>
          <PageSection title='Other meanings'>
            <Text style={typography.body}>{otherMeanings.join(', ')}</Text>
          </PageSection>
          <View style={{ height: 16 }} />
        </View>
      )}
      <PageSection title='Word Type'>
        <Text style={typography.body}>
          {subject.parts_of_speech.join(', ')}
        </Text>
      </PageSection>
      <View style={{ height: 16 }} />
      <PageSection title='Meaning Explanation'>
        <CustomTagRenderer style={styles.meaningExplanation}>
          {subject.meaning_mnemonic}
        </CustomTagRenderer>
      </PageSection>
    </Fragment>
  )
}

interface KanjiProps extends BaseProps {
  subject: Kanji
}

export const KanjiSection = ({ subject, showMeaning }: KanjiProps) => {
  const { styles } = useStyles(stylesheet)
  const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)?.meaning
  const otherMeanings = SubjectUtils.getOtherMeaning(subject).map(
    el => el.meaning,
  )

  return (
    <Fragment>
      {showMeaning && (
        <View>
          <PageSection title='Meaning'>
            <Text style={typography.body}>{primaryMeaning}</Text>
          </PageSection>
          <View style={{ height: 16 }} />
        </View>
      )}
      {otherMeanings.length > 0 && (
        <View>
          <PageSection title='Other meanings'>
            <Text style={typography.body}>{otherMeanings.join(', ')}</Text>
          </PageSection>
          <View style={{ height: 16 }} />
        </View>
      )}
      <PageSection title='Meaning Mnemonic'>
        <CustomTagRenderer style={styles.meaningExplanation}>
          {subject.meaning_mnemonic}
        </CustomTagRenderer>
        <View style={{ height: 16 }} />
        <Hint>{subject.meaning_hint}</Hint>
      </PageSection>
    </Fragment>
  )
}

interface RadicalProps extends BaseProps {
  subject: Radical
}

export const RadicalSection = ({ subject, showMeaning }: RadicalProps) => {
  const { styles } = useStyles(stylesheet)
  const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)?.meaning

  return (
    <Fragment>
      {showMeaning && (
        <View>
          <PageSection title='Meaning'>
            <Text style={typography.body}>{primaryMeaning}</Text>
          </PageSection>
          <View style={{ height: 16 }} />
        </View>
      )}
      <PageSection title='Mnemonic'>
        <CustomTagRenderer style={styles.meaningExplanation}>
          {subject.meaning_mnemonic}
        </CustomTagRenderer>
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
  meaningExplanation: {
    ...typography.body,
  },
})
