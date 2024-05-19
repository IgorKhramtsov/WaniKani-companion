import { Kanji } from '@/src/types/kanji'
import { SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { StringUtils } from '@/src/utils/stringUtils'
import { FlatList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { GlyphTile } from './GlyphTile'
import { Page, PageSection } from './Page'

type CompositionPageProps = {
  subject: Vocabulary | Kanji
}

export const CompositionPage = ({ subject }: CompositionPageProps) => {
  const { styles } = useStyles(compositionPageStylesheet)

  const name = subject.type.toString()
  const componentName = SubjectUtils.isVocabulary(subject) ? 'Kanji' : 'Radical'
  const countWord = StringUtils.digitToWord(
    subject.component_subject_ids.length,
  )

  return (
    <Page>
      <PageSection title={`${componentName} composition`}>
        <Text>
          The {name} is composed of {countWord} {componentName.toLowerCase()}:
        </Text>
        <View style={{ height: 24 }} />
        <FlatList
          style={styles.flatList}
          data={subject.component_subject_ids}
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
