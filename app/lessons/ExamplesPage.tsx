import { FlatList, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import typography from '@/src/constants/typography'
import { Kanji } from '@/src/types/kanji'
import { Radical } from '@/src/types/radical'
import { SubjectUtils } from '@/src/types/subject'
import { GlyphTile } from './GlyphTile'

type Props = {
  subject: Kanji | Radical
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

export const ExamplesPage = ({ subject, bottomContent, topContent }: Props) => {
  const { styles } = useStyles(stylesheet)

  console.log('\n\nExamples', subject.amalgamation_subject_ids)
  const componentName = SubjectUtils.isKanji(subject) ? 'Vocabulary' : 'Kanji'

  return (
    <Page bottomContent={bottomContent} topContent={topContent}>
      <PageSection title={`${componentName} Examples`}>
        <View style={{ height: 24 }} />
        <FlatList
          scrollEnabled={false}
          style={styles.flatList}
          data={subject.amalgamation_subject_ids.slice(0, 3)}
          renderItem={el => <GlyphTile id={el.item} />}
          ItemSeparatorComponent={() => (
            <View style={styles.flatListSeparator} />
          )}
          horizontal
        />
      </PageSection>
    </Page>
  )
}

const stylesheet = createStyleSheet({
  flatList: {
    flexGrow: 0,
  },
  flatListSeparator: {
    height: 16,
  },
  jaText: {
    ...typography.body,
  },
  enText: {
    ...typography.body,
  },
  explanation: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.4,
  },
})
