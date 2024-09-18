import typography from '@/src/constants/typography'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  ActivityIndicator,
  ColorValue,
  StyleProp,
  Text,
  TextStyle,
  View,
  StyleSheet,
} from 'react-native'
import { SvgXml } from 'react-native-svg'
import { convertSvg } from '../utils/svgConverter'

export const SubjectSymbol = ({
  subject,
  textStyle = typography.titleB,
}: {
  subject: Subject
  color?: ColorValue
  textStyle?: StyleProp<TextStyle>
}) => {
  const flattenedStyle = StyleSheet.flatten(textStyle)
  const size = flattenedStyle?.fontSize ?? 24
  const height = flattenedStyle?.lineHeight ?? 1.272 * size
  const color = flattenedStyle?.color ?? 'black'
  const shouldLoadSvg = useMemo(
    () => SubjectUtils.isRadical(subject) && !subject.characters,
    [subject],
  )
  const svgImage = useMemo(
    () =>
      SubjectUtils.isRadical(subject)
        ? subject.character_images.find(e => e.content_type === 'image/svg+xml')
        : undefined,
    [subject],
  )
  const rawSvg = useQuery({
    queryKey: ['subject-symbol', svgImage?.url],
    queryFn: async () => fetch(svgImage?.url ?? '').then(res => res.text()),
    enabled: !!svgImage && shouldLoadSvg,
  })
  const processedSvg = useMemo(() => {
    const svg = rawSvg.data
    if (svg === undefined) {
      return undefined
    }

    return convertSvg(svg)
  }, [rawSvg.data])

  if (SubjectUtils.isRadical(subject) && !subject.characters) {
    if (processedSvg) {
      return (
        <View
          style={{
            minWidth: size,
            minHeight: height,
            justifyContent: 'center',
          }}>
          <SvgXml
            height={size}
            width={size}
            preserveAspectRatio='xMidYMid meet'
            color={color ?? 'black'}
            xml={processedSvg}
          />
        </View>
      )
    } else if (rawSvg.isLoading) {
      return (
        <View
          style={{
            minWidth: size,
            minHeight: height,
            justifyContent: 'center',
          }}>
          <ActivityIndicator size='small' color='#FFFFFF' />
        </View>
      )
    } else {
      return <Text style={typography.titleB}>error</Text>
    }
  }
  if (subject.characters) {
    return <Text style={textStyle}>{subject.characters}</Text>
  } else {
    return '??'
  }
}
