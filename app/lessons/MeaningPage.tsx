import { Kanji } from '@/src/types/kanji'
import { SubjectType, SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import CustomTagRenderer from '@/src/components/CustomRenderer/Index'
import typography from '@/src/constants/typography'
import { Hint } from './Hint'
import { Radical } from '@/src/types/radical'
import { KanaVocabulary } from '@/src/types/kanaVocabulary'

interface BaseProps {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

interface Props extends BaseProps {
  subject: SubjectType
}

export const MeaningPage = ({ subject, ...args }: Props) => {
  if (SubjectUtils.isKanji(subject)) {
    return KanjiPage({ subject, ...args })
  } else if (
    SubjectUtils.isVocabulary(subject) ||
    SubjectUtils.isKanaVocabulary(subject)
  ) {
    return VocabularyPage({ subject, ...args })
  } else if (SubjectUtils.isRadical(subject)) {
    return RadicalPage({ subject, ...args })
  } else {
    return <Text>unknown subject</Text>
  }
}

interface VocabularyProps extends BaseProps {
  subject: Vocabulary | KanaVocabulary
}

export const VocabularyPage = ({
  subject,
  topContent,
  bottomContent,
}: VocabularyProps) => {
  const { styles } = useStyles(stylesheet)

  const otherMeanings = SubjectUtils.getOtherMeaning(subject).map(
    el => el.meaning,
  )

  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
      <PageSection title='Other meanings'>
        <Text style={typography.body}>{otherMeanings.join(', ')}</Text>
      </PageSection>
      <View style={{ height: 16 }} />
      <PageSection title='Word Type'>
        <Text style={typography.body}>{subject.parts_of_speech}</Text>
      </PageSection>
      <View style={{ height: 16 }} />
      <PageSection title='Meaning Explanation'>
        <CustomTagRenderer style={styles.meaningExplanation}>
          {subject.meaning_mnemonic}
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

  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
      <PageSection title='Meaning Mnemonic'>
        <CustomTagRenderer style={styles.meaningExplanation}>
          {subject.meaning_mnemonic}
        </CustomTagRenderer>
        <View style={{ height: 16 }} />
        <Hint>{subject.meaning_hint}</Hint>
      </PageSection>
    </Page>
  )
}

interface RadicalProps extends BaseProps {
  subject: Radical
}

export const RadicalPage = ({
  subject,
  topContent,
  bottomContent,
}: RadicalProps) => {
  const { styles } = useStyles(stylesheet)

  return (
    <Page topContent={topContent} bottomContent={bottomContent}>
      <PageSection title='Mnemonic'>
        <CustomTagRenderer style={styles.meaningExplanation}>
          {subject.meaning_mnemonic}
        </CustomTagRenderer>
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
  meaningExplanation: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.4,
  },
})
