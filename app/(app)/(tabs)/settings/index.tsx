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
import { useTabPress } from '@/src/hooks/useTabPress'
import { useEffect, useState } from 'react'
import Toast from 'react-native-root-toast'

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
  const { settings, setProperty, isLoading } = useSettings()
  const [debugEnableCounter, setDebugEnableCounter] = useState(0)

  useTabPress(() => {
    setDebugEnableCounter(c => c + 1)
  })

  useEffect(() => {
    if (debugEnableCounter > 5) {
      setDebugEnableCounter(0)
      setProperty('enable_debug_mode', !settings.debug_mode_enabled)
      Toast.show(
        'Debug mode is now ' + (settings.debug_mode_enabled ? 'on' : 'off'),
        {
          containerStyle: {
            paddingHorizontal: 32,
          },
          duration: Toast.durations.LONG,
          position: -100,
          backgroundColor: Colors.blue,
          shadowColor: Colors.grayC5,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        },
      )
    }
  }, [debugEnableCounter, setProperty, settings.debug_mode_enabled])

  if (isLoading) return <FullPageLoading />
  if (!settings) return <Text>Couldn't get user preferences</Text>

  const sectionsData: SectionsData[] = [
    {
      title: 'Lesson',
      data: [
        {
          title: 'Preferred lesson batch size',
          type: 'page',
          value: settings.lessons_batch_size,
          onPress: () => router.navigate('/(tabs)/settings/batchSize'),
        },
        {
          title: 'Maximum recommended daily lessons',
          type: 'page',
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
        {
          title: 'Interleave Advanced Lessons',
          type: 'page',
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
          value: settings.reviews_display_srs_indicator,
          onPress: () =>
            setProperty(
              'reviews_display_srs_indicator',
              !settings.reviews_display_srs_indicator,
            ),
        },
      ],
    },
    {
      data: [
        {
          title: 'Review ordering',
          type: 'page',
          value: settings.reviews_presentation_order,
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
          value: settings.default_voice,
          onPress: () => router.navigate('/(tabs)/settings/defaultVoice'),
        },
        {
          title: 'Autoplay audio in lessons',
          type: 'switch',
          value: settings.lessons_autoplay_audio,
          onPress: () =>
            setProperty(
              'lessons_autoplay_audio',
              !settings.lessons_autoplay_audio,
            ),
        },
        {
          title: 'Autoplay audio in reviews',
          type: 'switch',
          value: settings.reviews_autoplay_audio,
          onPress: () =>
            setProperty(
              'reviews_autoplay_audio',
              !settings.reviews_autoplay_audio,
            ),
        },
        {
          title: 'Autoplay audio in extra study',
          type: 'switch',
          value: settings.extra_study_autoplay_audio,
          onPress: () =>
            setProperty(
              'extra_study_autoplay_audio',
              !settings.extra_study_autoplay_audio,
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
            ? StringUtils.convertEnumTypeToString(item.value)
            : item.value
        return (
          <View style={appStyles.rowSpaceBetween}>
            <Text style={textStyle}>{item.title}</Text>
            {item.type === 'switch' && (
              <Switch value={item.value} onValueChange={item.onPress} />
            )}
            {item.type === 'page' && (
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
            )}
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
