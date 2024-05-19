import { Kanji } from '@/src/types/kanji'
import { SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import CustomTagRenderer from '@/src/components/CustomRenderer/Index'
import typography from '@/src/constants/typography'
import { Hint } from './Hint'

type Props = {
  subject: Vocabulary | Kanji
}

export const MeaningPage = ({ subject }: Props) => {
  return SubjectUtils.isKanji(subject)
    ? KanjiPage({ subject })
    : VocabularyPage({ subject })
}

type VocabularyProps = {
  subject: Vocabulary
}

export const VocabularyPage = ({ subject }: VocabularyProps) => {
  const { styles } = useStyles(stylesheet)

  const otherMeanings = SubjectUtils.getOtherMeaning(subject).map(
    el => el.meaning,
  )

  return (
    <Page>
      <PageSection title='Other meanings'>
        <Text>{otherMeanings.join(', ')}</Text>
      </PageSection>
      <View style={{ height: 16 }} />
      <PageSection title='Word Type'>
        <Text>{subject.parts_of_speech}</Text>
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

type KanjiProps = {
  subject: Kanji
}

export const KanjiPage = ({ subject }: KanjiProps) => {
  const { styles } = useStyles(stylesheet)

  return (
    <Page>
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
