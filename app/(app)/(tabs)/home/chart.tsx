import React, { Fragment, useMemo } from 'react'
import { Dimensions } from 'react-native'
import {
  Canvas,
  Path,
  Skia,
  Circle,
  Color,
  vec,
  LinearGradient,
  PaintStyle,
  TextAlign,
  Paragraph,
} from '@shopify/react-native-skia'
import {
  useSharedValue,
  useDerivedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import typography from '@/src/constants/typography'
import tinycolor from 'tinycolor2'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface LessonData {
  timestamp: number // Unix timestamp in milliseconds
  lessons: number
}

interface ChartProps {
  data: LessonData[]
  width?: number
  height?: number
  color: Color
  lineColor: Color
  labelCount?: number
  bgColor?: Color
}

const Chart: React.FC<ChartProps> = ({
  data,
  width = SCREEN_WIDTH,
  height = 200,
  color = 'rgba(255, 69, 0, 0.2)',
  lineColor = '#FF4500',
  bgColor = 'white',
  labelCount = 5,
}) => {
  const labelSize = 14
  const paddingTop = 10
  const horizontalPadding = 20
  const innerWidth = width - horizontalPadding * 2
  const innerHeight = height - labelSize - paddingTop
  const touchedPoint = useSharedValue<{ x: number; y: number } | null>(null)
  const hasTouch = useSharedValue(false)

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.timestamp - b.timestamp)
  }, [data])

  const timeRange = useMemo(() => {
    const startTime = sortedData[0].timestamp
    const endTime = sortedData[sortedData.length - 1].timestamp
    return { startTime, endTime, duration: endTime - startTime }
  }, [sortedData])

  const path = useMemo(() => {
    const skPath = Skia.Path.Make()
    sortedData.forEach((point, index) => {
      const isFirst = index === 0
      const isLast = index === sortedData.length - 1
      const x =
        ((point.timestamp - timeRange.startTime) / timeRange.duration) *
          innerWidth +
        (isFirst ? 0 : isLast ? horizontalPadding * 2 : horizontalPadding)
      const y =
        innerHeight +
        paddingTop -
        (point.lessons / Math.max(...data.map(d => d.lessons))) * innerHeight
      if (index === 0) {
        skPath.moveTo(x, y)
      } else {
        const prevX =
          ((sortedData[index - 1].timestamp - timeRange.startTime) /
            timeRange.duration) *
            innerWidth +
          horizontalPadding
        const prevY =
          innerHeight +
          paddingTop -
          (sortedData[index - 1].lessons /
            Math.max(...data.map(d => d.lessons))) *
            innerHeight
        const midX = (prevX + x) / 2
        skPath.cubicTo(midX, prevY, midX, y, x, y)
      }
    })
    return skPath
  }, [data, sortedData, innerWidth, innerHeight, timeRange])

  const fillPath = useMemo(() => {
    const skPath = path.copy()
    skPath.lineTo(width, innerHeight)
    skPath.lineTo(0, innerHeight)
    skPath.close()
    return skPath
  }, [path, width, innerHeight])

  const timePointsForLabels = useMemo(() => {
    const paddingHours = Math.round(data.length / labelCount / 2)
    console.log('paddingHours', paddingHours)
    const adjustedStartTime =
      timeRange.startTime + paddingHours * 1000 * 60 * 60
    const adjustedRange = timeRange.duration - paddingHours * 0 * 1000 * 60 * 60
    const portion = 1 / labelCount

    return Array.from({ length: labelCount }, (_, i) => {
      const pointer = i * portion
      const offset =
        Math.round((pointer * adjustedRange) / 1000 / 60 / 60) * 1000 * 60 * 60
      const timestamp = adjustedStartTime + offset

      const x =
        ((timestamp - timeRange.startTime) / timeRange.duration) * innerWidth +
        horizontalPadding
      const date = new Date(timestamp)
      const timeFormatter = Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric',
      })
      const formattedTime = timeFormatter.format(date)
      return { formattedTime, x }
    })
  }, [data.length, labelCount, innerWidth, timeRange])

  const timeLabels = useMemo(() => {
    const fontFaceProvider = Skia.TypefaceFontProvider.Make()
    const paragraphStyle = {
      textAlign: TextAlign.Center,
    }
    const textStyle = {
      color: Skia.Color('black'),
      fontFamilies: ['Noto Sans'],
      fontSize: typography.label.fontSize,
    }
    return timePointsForLabels.map(({ formattedTime, x }) => {
      const paragraph = Skia.ParagraphBuilder.Make(
        paragraphStyle,
        fontFaceProvider,
      )
        .pushStyle(textStyle)
        .addText(formattedTime)
        .build()
      paragraph.layout(100)
      return {
        x,
        paragraph,
      }
    })
  }, [timePointsForLabels])

  const updateTouchedPoint = (x: number) => {
    const nearestPoint = sortedData.reduce((prev, curr) => {
      const prevX =
        ((prev.timestamp - timeRange.startTime) / timeRange.duration) *
          innerWidth +
        horizontalPadding
      const currX =
        ((curr.timestamp - timeRange.startTime) / timeRange.duration) *
          innerWidth +
        horizontalPadding
      return Math.abs(prevX - x) < Math.abs(currX - x) ? prev : curr
    })
    touchedPoint.value = {
      x:
        ((nearestPoint.timestamp - timeRange.startTime) / timeRange.duration) *
          innerWidth +
        horizontalPadding,
      y:
        innerHeight +
        paddingTop -
        (nearestPoint.lessons / Math.max(...data.map(d => d.lessons))) *
          innerHeight,
    }
  }

  const gesture = Gesture.Pan()
    .onBegin(e => {
      hasTouch.value = true
      runOnJS(updateTouchedPoint)(e.x)
    })
    .onChange(e => {
      runOnJS(updateTouchedPoint)(e.x)
    })
    .onFinalize(() => {
      hasTouch.value = false
    })

  const animatedPath = useDerivedValue(() => {
    return path
  }, [path])

  const circlePoints = useMemo(() => {
    return sortedData.reduce((acc, point, index) => {
      if (index === 0 || point.lessons !== sortedData[index - 1].lessons) {
        acc.push(point)
      }
      return acc
    }, [] as LessonData[])
  }, [sortedData])

  const circleX = useDerivedValue(
    () => touchedPoint?.value?.x ?? 0,
    [touchedPoint],
  )
  const circleY = useDerivedValue(
    () => touchedPoint?.value?.y ?? 0,
    [touchedPoint],
  )
  const animatedRadius = useDerivedValue(() => {
    return withSpring(hasTouch.value ? 6 : 0, {
      stiffness: hasTouch.value ? 1000 : 100,
      damping: hasTouch.value ? 1000 : 10,
    })
  }, [hasTouch])

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ width, height }}>
        <Path key='fillpath' path={fillPath}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, innerHeight)}
            colors={[
              tinycolor(color.toString()).setAlpha(0.6).toString(),
              tinycolor(color.toString()).setAlpha(0).toString(),
            ]}
          />
        </Path>
        <Path
          key='path'
          path={animatedPath}
          color={lineColor}
          style='stroke'
          strokeWidth={2}
        />
        {circlePoints.map((point, index) => {
          const x =
            ((point.timestamp - timeRange.startTime) / timeRange.duration) *
              innerWidth +
            horizontalPadding
          const y =
            innerHeight +
            paddingTop -
            (point.lessons / Math.max(...data.map(d => d.lessons))) *
              innerHeight
          const fillPaint = Skia.Paint()
          fillPaint.setStyle(PaintStyle.Fill)
          fillPaint.setColor(Skia.Color(lineColor))

          const strokePaint = Skia.Paint()
          strokePaint.setStyle(PaintStyle.Stroke)
          strokePaint.setStrokeWidth(3)
          strokePaint.setColor(Skia.Color(bgColor))

          return (
            <Fragment key={index}>
              <Circle
                key={`${index}-stroke`}
                cx={x}
                cy={y}
                r={4}
                paint={strokePaint}
              />
              <Circle
                key={`${index}-fill`}
                cx={x}
                cy={y}
                r={4}
                paint={fillPaint}
              />
            </Fragment>
          )
        })}
        {timeLabels.map((label, index) => {
          const width = label.paragraph.getLongestLine() + 1
          return (
            <Paragraph
              key={label.x}
              paragraph={label.paragraph}
              x={label.x - width / 2}
              y={innerHeight + labelSize - 14}
              width={width}
            />
          )
        })}
        {<Circle cx={circleX} cy={circleY} r={animatedRadius} color='blue' />}
      </Canvas>
    </GestureDetector>
  )
}

export default Chart
