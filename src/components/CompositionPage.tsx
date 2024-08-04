import { Kanji } from '@/src/types/kanji'
import { SubjectUtils } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { StringUtils } from '@/src/utils/stringUtils'
import { FlatList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SubjectTile } from '@/src/components/SubjectTile'
import { Page, PageSection } from './Page'
import { Fragment, useMemo } from 'react'
import typography from '@/src/constants/typography'

interface PageProps {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

type CompositionPageProps = {
  subject: Vocabulary | Kanji
}

export const CompositionPage = ({
  subject,
  bottomContent,
  topContent,
}: CompositionPageProps & PageProps) => {
  return (
    <Page bottomContent={bottomContent} topContent={topContent}>
      <CompositionSection subject={subject} />
    </Page>
  )
}

export const CompositionSection = ({ subject }: CompositionPageProps) => {
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
    <Fragment>
      <PageSection title={`${componentName} composition`}>
        {false && (
          // TODO: consider if we should show this text at all, it is generic.
          <Fragment>
            <Text style={typography.body}>
              The {name} is composed of {countWord}{' '}
              {componentName.toLowerCase()}:
            </Text>
            <View style={{ height: 24 }} />
          </Fragment>
        )}
        <FlatList
          scrollEnabled={false}
          style={styles.flatList}
          data={subjectIdsToShow}
          renderItem={el => <SubjectTile key={el.item} id={el.item} />}
          ItemSeparatorComponent={() => (
            <View style={styles.flatListSeparator} />
          )}
          horizontal
        />
      </PageSection>
    </Fragment>
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
