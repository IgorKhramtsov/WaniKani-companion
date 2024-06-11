import typography from '@/src/constants/typography'
import { Text, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSettings } from '@/src/hooks/useSettings'
import { FontAwesome5 } from '@expo/vector-icons'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { preferences, setProperty, isLoading } = useSettings()
  const batchSizes = Array.from(Array(11 - 3).keys()).map(el => el + 3)

  if (isLoading) return <FullPageLoading />
  if (!preferences) return <Text>Couldn't get user preferences</Text>

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Preferred lesson batch size',
          footer:
            'Set the preferred number of new lessons to do before each lesson quiz. The actual number may sometimes be higher to avoid small lesson batches at the end.',
          data: batchSizes,
        },
      ]}
      renderItem={item => (
        <View style={appStyles.rowSpaceBetween}>
          <Text style={styles.itemText}>{item}</Text>
          {preferences.lessons_batch_size === item && (
            <FontAwesome5 name='check' size={16} color={Colors.blue} />
          )}
        </View>
      )}
      itemWrapper={(item, children) => (
        <Pressable onPress={() => setProperty('lessons_batch_size', item)}>
          {children}
        </Pressable>
      )}
    />
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
})
