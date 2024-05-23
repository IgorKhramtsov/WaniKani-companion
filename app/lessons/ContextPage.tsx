import { Vocabulary } from '@/src/types/vocabulary'
import { FlatList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import typography from '@/src/constants/typography'
import { KanaVocabulary } from '@/src/types/kanaVocabulary'

type Props = {
  subject: Vocabulary | KanaVocabulary
}

export const ContextPage = ({ subject }: Props) => {
  const { styles } = useStyles(stylesheet)

  console.log('\n\nContext', subject.context_sentences)

  return (
    <Page>
      <PageSection title='Context Sentences'>
        <FlatList
          scrollEnabled={false}
          style={styles.flatList}
          data={subject.context_sentences}
          renderItem={el => (
            <View>
              <Text style={styles.jaText}>{el.item.ja}</Text>
              <Text style={styles.enText}>{el.item.en}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={styles.flatListSeparator} />
          )}
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
