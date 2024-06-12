import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { router } from 'expo-router'
import { View, Text, Pressable, Switch } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { AntDesign } from '@expo/vector-icons'
import { useSession } from '@/src/context/authContext'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { StringUtils } from '@/src/utils/stringUtils'
import { useSettings } from '@/src/hooks/useSettings'

type SectionItemType = 'page' | 'switch' | 'destructiveButton'
interface SectionsData {
  title?: string
  footer?: string
  data: {
    title: string
    type: SectionItemType
    value?: any
    onPress: () => void
  }[]
}

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { signOut } = useSession()
  const { preferences, setProperty, isLoading } = useSettings()

  if (isLoading) return <FullPageLoading />
  if (!preferences) return <Text>Couldn't get user preferences</Text>

  const sectionsData: SectionsData[] = [
    {
      title: 'Lesson',
      data: [
        {
          title: 'Preferred lesson batch size',
          type: 'page',
          value: preferences.lessons_batch_size,
          onPress: () => router.navigate('/(tabs)/settings/batchSize'),
        },
        {
          title: 'Maximum recommended daily lessons',
          type: 'page',
          // TODO: local setting
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
        {
          title: 'Interleave Advanced Lessons',
          type: 'page',
          // TODO: local setting
          onPress: () =>
            router.navigate('/(tabs)/settings/interleaveAdvancedLessons'),
        },
      ],
    },
    {
      title: 'Review',
      footer:
        'During the review session the SRS change indicator will appear for items completed.',
      data: [
        {
          title: 'SRS update indicator during reviews',
          type: 'switch',
          value: preferences.reviews_display_srs_indicator,
          onPress: () =>
            setProperty(
              'reviews_display_srs_indicator',
              !preferences.reviews_display_srs_indicator,
            ),
        },
      ],
    },
    {
      data: [
        {
          title: 'Review ordering',
          type: 'page',
          value: preferences.reviews_presentation_order,
          onPress: () => router.navigate('/(tabs)/settings/reviewOrdering'),
        },
      ],
    },
    {
      title: 'Audio',
      data: [
        {
          title: 'Default voice',
          type: 'page',
          // TODO: local setting
          // value: preferences.lessons_autoplay_audio,
          onPress: () => router.navigate('/(tabs)/settings/defaultVoice'),
        },
        {
          title: 'Autoplay audio in lessons',
          type: 'switch',
          value: preferences.lessons_autoplay_audio,
          onPress: () =>
            setProperty(
              'lessons_autoplay_audio',
              !preferences.lessons_autoplay_audio,
            ),
        },
        {
          title: 'Autoplay audio in reviews',
          type: 'switch',
          value: preferences.reviews_autoplay_audio,
          onPress: () =>
            setProperty(
              'reviews_autoplay_audio',
              !preferences.reviews_autoplay_audio,
            ),
        },
        {
          title: 'Autoplay audio in extra study',
          type: 'switch',
          value: preferences.extra_study_autoplay_audio,
          onPress: () =>
            setProperty(
              'extra_study_autoplay_audio',
              !preferences.extra_study_autoplay_audio,
            ),
        },
      ],
    },
    {
      title: 'Account',
      data: [
        {
          title: 'Logout',
          type: 'destructiveButton',
          onPress: () => signOut(),
        },
      ],
    },
  ]

  return (
    <SettingsSectionedPage
      sections={sectionsData}
      itemWrapper={(item, children) => {
        if (item.type === 'switch') return children

        return <Pressable onPress={item.onPress}>{children}</Pressable>
      }}
      renderItem={item => {
        const textColor =
          item.type === 'destructiveButton' ? Colors.destructiveRed : undefined
        const textStyle = [styles.itemText, { color: textColor }]
        const valueString =
          item.value && typeof item.value === 'string'
            ? StringUtils.capitalizeFirstLetter(item.value.replaceAll('_', ' '))
            : item.value
        return (
          <View style={appStyles.rowSpaceBetween}>
            <Text style={textStyle}>{item.title}</Text>
            {item.type === 'switch' && (
              <Switch value={item.value} onValueChange={item.onPress} />
            )}
            {
              // TODO: show current value
              item.type === 'page' && (
                <View style={appStyles.row}>
                  {item.value && typeof item.value === 'string' && (
                    <Text style={styles.itemValueText}>{valueString}</Text>
                  )}
                  <View style={{ width: 8 }} />
                  <AntDesign
                    name='right'
                    size={typography.body.fontSize}
                    color={Colors.grayC5}
                  />
                </View>
              )
            }
          </View>
        )
      }}
    />
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
  itemValueText: {
    ...typography.body,
    color: Colors.gray88,
  },
})
