import typography from '@/src/constants/typography'
import { Text, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSettings } from '@/src/hooks/useSettings'
import { FontAwesome5 } from '@expo/vector-icons'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'
import { voiceTypeStrings } from '@/src/types/localSettings'
import { StringUtils } from '@/src/utils/stringUtils'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { settings, setProperty, isLoading } = useSettings()
  const data = voiceTypeStrings

  if (isLoading) return <FullPageLoading />
  if (!settings) return <Text>Couldn't get user preferences</Text>

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Vocabulary pronunciation voice',
          footer: 'The default voice used in Lessons and Reviews',
          data: data,
        },
      ]}
      renderItem={item => (
        <View style={appStyles.rowSpaceBetween}>
          <Text style={styles.itemText}>
            {StringUtils.convertEnumTypeToString(item)}
          </Text>
          {settings.default_voice === item && (
            <FontAwesome5 name='check' size={16} color={Colors.blue} />
          )}
        </View>
      )}
      itemWrapper={(item, children) => (
        <Pressable onPress={() => setProperty('default_voice', item)}>
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
