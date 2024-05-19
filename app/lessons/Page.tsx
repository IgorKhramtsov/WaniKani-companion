import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { PropsWithChildren } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

/**
 * Use [PageSection] for adding sections to the page.
 */
export const Page = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles(pageStylesheet)

  return <View style={styles.pageView}>{children}</View>
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
