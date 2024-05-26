import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { PropsWithChildren } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface Props extends PropsWithChildren {
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
}

/**
 * Use [PageSection] for adding sections to the page.
 */
export const Page = ({ children, topContent, bottomContent }: Props) => {
  const { styles } = useStyles(pageStylesheet)

  return (
    <ScrollView style={[styles.pageView]}>
      {topContent && topContent}
      {children}
      {bottomContent && bottomContent}
    </ScrollView>
  )
}

type PageSectionProps = PropsWithChildren<{
  title: string
}>

export const PageSection = ({ children, title }: PageSectionProps) => {
  const { styles } = useStyles(pageStylesheet)

  return (
    <View>
      <Text style={styles.titleText}>{title}</Text>
      <View style={styles.separator} />
      <View style={{ height: 12 }} />
      {children}
    </View>
  )
}

const pageStylesheet = createStyleSheet({
  pageView: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleText: {
    ...typography.titleB,
    fontWeight: '300',
  },
  separator: {
    borderBottomColor: Colors.grayDark,
    borderBottomWidth: 1,
  },
})
