import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import typography from '@/src/constants/typography'
import { AntDesign } from '@expo/vector-icons'
import { PropsWithChildren } from 'react'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'
import CustomTagRenderer from '@/src/components/CustomRenderer/Index'

export const Hint = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles(stylesheet)
  return (
    <View style={styles.container}>
      <View style={appStyles.row}>
        <AntDesign name='questioncircleo' size={16} color='black' />
        <View style={{ width: 8 }} />
        <Text style={styles.hintTitle}>HINT</Text>
      </View>
      <View style={{ height: 8 }} />
      <CustomTagRenderer style={styles.hintText}>{children}</CustomTagRenderer>
    </View>
  )
}

const stylesheet = createStyleSheet({
  container: {
    backgroundColor: Colors.generalGray,
    padding: 16,
  },
  hintTitle: {
    ...typography.body,
    fontWeight: 400,
    letterSpacing: 1.1,
  },
  hintText: {
    ...typography.body,
    fontWeight: '300',
    lineHeight: typography.body.fontSize * 1.3,
    letterSpacing: 0.75,
  },
})
