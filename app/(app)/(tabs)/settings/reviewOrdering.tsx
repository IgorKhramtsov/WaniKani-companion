import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { View, Text, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { ReviewsPresentationOrder } from '@/src/types/preferences'
import { FontAwesome5 } from '@expo/vector-icons'
import { useSettings } from '@/src/hooks/useSettings'
import { FullPageLoading } from '@/src/components/FullPageLoading'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { settings, setProperty, isLoading } = useSettings()
  const data: { title: string; value: ReviewsPresentationOrder }[] = [
    {
      title: 'Shuffled',
      value: 'shuffled',
    },
    {
      title: 'Lower levels first',
      value: 'lower_levels_first',
    },
  ]

  if (isLoading) return <FullPageLoading />
  if (!settings) return <Text>Couldn't get user preferences</Text>

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Review ordering',
          footer:
            'Set the ordering of reviews. Shuffled presents in random order. Lower levels first is still random but prioritizes lower level subjects first.',
          data: data,
        },
      ]}
      renderItem={item => (
        <View style={appStyles.rowSpaceBetween}>
          <Text style={styles.itemText}>{item.title}</Text>
          {settings.reviews_presentation_order === item.value && (
            <FontAwesome5 name='check' size={16} color={Colors.blue} />
          )}
        </View>
      )}
      itemWrapper={(item, children) => (
        <Pressable
          onPress={() => setProperty('reviews_presentation_order', item.value)}>
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
