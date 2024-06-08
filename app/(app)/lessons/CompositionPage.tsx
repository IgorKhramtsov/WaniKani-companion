import { Kanji } from '@/src/types/kanji'
import { SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { StringUtils } from '@/src/utils/stringUtils'
import { FlatList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { GlyphTile } from './GlyphTile'
import { Page, PageSection } from './Page'
import { useMemo } from 'react'

type CompositionPageProps = {
  subject: Vocabulary | Kanji
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

export const CompositionPage = ({
  subject,
  bottomContent,
  topContent,
}: CompositionPageProps) => {
  const { styles } = useStyles(compositionPageStylesheet)
  const subjectIdsToShow = useMemo(() => {
    return subject.component_subject_ids
  }, [subject])

  const name = subject.type.toString()
  const componentName = SubjectUtils.isVocabulary(subject) ? 'Kanji' : 'Radical'
  const countWord = StringUtils.digitToWord(
    subject.component_subject_ids.length,
  )

  return (
    <Page bottomContent={bottomContent} topContent={topContent}>
      <PageSection title={`${componentName} composition`}>
        <Text>
          The {name} is composed of {countWord} {componentName.toLowerCase()}:
        </Text>
        <View style={{ height: 24 }} />
        <FlatList
          scrollEnabled={false}
          style={styles.flatList}
          data={subjectIdsToShow}
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

const compositionPageStylesheet = createStyleSheet({
  flatList: {
    flexGrow: 0,
  },
  flatListSeparator: {
    width: 24,
  },
})
