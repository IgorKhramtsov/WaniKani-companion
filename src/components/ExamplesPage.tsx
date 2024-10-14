import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Page, PageSection } from './Page'
import typography from '@/src/constants/typography'
import { Kanji } from '@/src/types/kanji'
import { Radical } from '@/src/types/radical'
import { SubjectUtils } from '@/src/types/subject'
import { SubjectTile } from '@/src/components/SubjectTile'
import { appStyles } from '@/src/constants/styles'
import { Fragment, useMemo } from 'react'

interface PageProps {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

type ViewVariant = 'standard' | 'minimal'

type Props = {
  subject: Kanji | Radical
  variant?: ViewVariant
}

export const ExamplesPage = ({
  bottomContent,
  topContent,
  ...props
}: Props & PageProps) => {
  return (
    <Page bottomContent={bottomContent} topContent={topContent}>
      <ExamplesSection {...props} />
    </Page>
  )
}

export const ExamplesSection = ({ subject, variant = 'minimal' }: Props) => {
  const { styles } = useStyles(stylesheet)
  const subjectIdsToShow = useMemo(() => {
    const source = subject.amalgamation_subject_ids
    if (variant === 'minimal') {
      return source.slice(0, 3)
    }
    return source
  }, [variant, subject])

  const componentName = SubjectUtils.isKanji(subject) ? 'Vocabulary' : 'Kanji'

  const listItemStyle =
    variant === 'minimal' ? styles.listItemMinimal : styles.listItemStandard

  return (
    <Fragment>
      <PageSection title={`${componentName} Examples`}>
        <View style={styles.wrapList}>
          {subjectIdsToShow.map(id => (
            // TODO: consider list for standard variant for optimization?
            <View style={listItemStyle} key={id}>
              <SubjectTile variant='extended' id={id} />
            </View>
          ))}
        </View>
      </PageSection>
    </Fragment>
  )
}

const stylesheet = createStyleSheet({
  wrapList: {
    ...appStyles.row,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  listItemMinimal: {
    minWidth: '50%',
    padding: 3,
  },
  listItemStandard: {
    minWidth: '100%',
    paddingVertical: 2,
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
