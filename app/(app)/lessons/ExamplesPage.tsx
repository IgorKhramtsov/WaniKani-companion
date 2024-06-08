import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import typography from '@/src/constants/typography'
import { Kanji } from '@/src/types/kanji'
import { Radical } from '@/src/types/radical'
import { SubjectUtils } from '@/src/types/subject'
import { GlyphTile } from './GlyphTile'
import { appStyles } from '@/src/constants/styles'
import { useMemo } from 'react'

type Props = {
  subject: Kanji | Radical
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

export const ExamplesPage = ({ subject, bottomContent, topContent }: Props) => {
  const { styles } = useStyles(stylesheet)
  const subjectIdsToShow = useMemo(() => {
    return subject.amalgamation_subject_ids.slice(0, 3)
  }, [subject])

  console.log('[ExamplesPage] ids: ', subject.amalgamation_subject_ids)
  const componentName = SubjectUtils.isKanji(subject) ? 'Vocabulary' : 'Kanji'

  return (
    <Page bottomContent={bottomContent} topContent={topContent}>
      <PageSection title={`${componentName} Examples`}>
        <View style={styles.wrapList}>
          {subjectIdsToShow.map(id => (
            <View style={styles.listItem} key={id}>
              <GlyphTile id={id} />
            </View>
          ))}
        </View>
      </PageSection>
    </Page>
  )
}

const stylesheet = createStyleSheet({
  wrapList: {
    ...appStyles.row,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  listItem: {
    minWidth: '50%',
    padding: 3,
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
