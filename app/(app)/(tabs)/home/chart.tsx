import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { LayoutChangeEvent } from 'react-native'
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
  SkParagraph,
  Group,
  Paint,
} from '@shopify/react-native-skia'
import {
  useSharedValue,
  useDerivedValue,
  runOnJS,
  withSpring,
  useAnimatedReaction,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import typography from '@/src/constants/typography'
import tinycolor from 'tinycolor2'
import { Colors } from '@/src/constants/Colors'

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
  labelsColor: Color
  bgColor?: Color
}

const paragraphStyle = {
  textAlign: TextAlign.Center,
}

const fontFaceProvider = Skia.TypefaceFontProvider.Make()

const Chart: React.FC<ChartProps> = ({
  data,
  height = 200,
  color = 'rgba(255, 69, 0, 0.2)',
  lineColor = '#FF4500',
  bgColor = 'white',
  labelsColor = 'white',
  labelCount = 5,
}) => {
  const labelSize = 14
  const paddingTop = 30
  const horizontalPadding = 20
  const [width, setWidth] = useState(0)
  const innerWidth = useMemo(() => width - horizontalPadding * 2, [width])
  const rInnerWidth = useSharedValue(width)
  const innerHeight = height - labelSize - paddingTop
  const touchedPoint = useSharedValue<{ x: number; y: number } | null>(null)
  const hasTouch = useSharedValue(false)

  useEffect(() => {
    rInnerWidth.value = innerWidth
  }, [rInnerWidth, innerWidth])

  const textStyle = useMemo(
    () => ({
      color: Skia.Color(labelsColor),
      fontFamilies: ['Noto Sans'],
      fontSize: typography.label.fontSize,
    }),
    [labelsColor],
  )

  const fillPaint = useMemo(() => {
    const paint = Skia.Paint()
    paint.setStyle(PaintStyle.Fill)
    paint.setColor(Skia.Color(bgColor))
    return paint
  }, [bgColor])

  const strokePaint = useMemo(() => {
    const paint = Skia.Paint()
    paint.setStyle(PaintStyle.Stroke)
    paint.setStrokeWidth(3)
    paint.setColor(Skia.Color(color))
    return paint
  }, [color])

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.timestamp - b.timestamp)
  }, [data])

  const timeRange = useMemo(() => {
    const startTime = sortedData[0].timestamp
    const endTime = sortedData[sortedData.length - 1].timestamp
    return { startTime, endTime, duration: endTime - startTime }
  }, [sortedData])

  const paddingHours = useMemo(
    () => Math.round(data.length / labelCount / 2),
    [data, labelCount],
  )
  const adjustedStartTime = useMemo(
    () => timeRange.startTime + paddingHours * 1000 * 60 * 60,
    [timeRange.startTime, paddingHours],
  )

  const path = useMemo(() => {
    const skPath = Skia.Path.Make()
    sortedData.forEach((point, index) => {
      const isFirst = index === 0
      const isLast = index === sortedData.length - 1
      const x =
        ((point.timestamp - timeRange.startTime) / timeRange.duration) *
          innerWidth +
        horizontalPadding
      const y =
        innerHeight +
        paddingTop -
        (point.lessons / Math.max(...data.map(d => d.lessons))) * innerHeight
      if (isFirst) {
        skPath.moveTo(0, y)
        skPath.lineTo(x, y)
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
      if (isLast) {
        skPath.lineTo(width, y)
      }
    })
    return skPath
  }, [data, width, sortedData, innerWidth, innerHeight, timeRange])

  const fillPath = useMemo(() => {
    const skPath = path.copy()
    skPath.lineTo(width, innerHeight)
    skPath.lineTo(0, innerHeight)
    skPath.close()
    return skPath
  }, [path, width, innerHeight])

  const timePointsForLabels = useMemo(() => {
    const portion = 1 / labelCount

    return Array.from({ length: labelCount }, (_, i) => {
      const pointer = i * portion
      const offset =
        Math.round((pointer * timeRange.duration) / 1000 / 60 / 60) *
        1000 *
        60 *
        60
      const timestamp = adjustedStartTime + offset

      const x =
        ((timestamp - timeRange.startTime) / timeRange.duration) * innerWidth +
        horizontalPadding
      return { timestamp, x }
    })
  }, [adjustedStartTime, labelCount, innerWidth, timeRange])

  const getLabelForTime = useCallback(
    (timestamp: number): SkParagraph => {
      const date = new Date(timestamp)
      const timeFormatter = Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric',
      })
      const formattedTime = timeFormatter.format(date)
      const paragraph = Skia.ParagraphBuilder.Make(
        paragraphStyle,
        fontFaceProvider,
      )
        .pushStyle(textStyle)
        .addText(formattedTime)
        .build()
      paragraph.layout(100)
      return paragraph
    },
    [textStyle],
  )

  const getLabelForLessons = useCallback(
    (lessons: number): SkParagraph => {
      const paragraph = Skia.ParagraphBuilder.Make(
        paragraphStyle,
        fontFaceProvider,
      )
        .pushStyle(textStyle)
        .addText(lessons.toString())
        .build()
      paragraph.layout(100)
      return paragraph
    },
    [textStyle],
  )

  const timeLabels = useMemo(() => {
    return timePointsForLabels.map(({ timestamp, x }) => {
      const paragraph = getLabelForTime(timestamp)
      return {
        x,
        paragraph,
      }
    })
  }, [getLabelForTime, timePointsForLabels])

  const allLabels = useMemo(() => {
    return Array.from({ length: data.length }, (_, i) => {
      const timestamp = data[i].timestamp
      const x =
        ((timestamp - timeRange.startTime) / timeRange.duration) * innerWidth +
        horizontalPadding
      const timePragraph = getLabelForTime(timestamp)
      const lessonsParagraph = getLabelForLessons(data[i].lessons)
      const timeWidth = timePragraph.getLongestLine()
      const lessonsWidth = lessonsParagraph.getLongestLine()
      const leftBound = horizontalPadding
      const rightBound = innerWidth - leftBound
      return {
        time: {
          x: Math.min(Math.max(leftBound, x - timeWidth / 2), rightBound),
          paragraph: timePragraph,
          width: timeWidth,
        },
        lessons: {
          x: Math.max(leftBound, x - lessonsWidth / 2),
          y:
            innerHeight +
            paddingTop -
            (data[i].lessons / Math.max(...data.map(d => d.lessons))) *
              innerHeight,
          paragraph: lessonsParagraph,
          width: lessonsWidth,
        },
      }
    })
  }, [
    data,
    getLabelForTime,
    getLabelForLessons,
    innerWidth,
    innerHeight,
    timeRange.duration,
    timeRange.startTime,
  ])

  const touchedTimeLabelIndex = useDerivedValue(() => {
    'worklet'
    const x = touchedPoint.value?.x
    if (x === undefined) return null

    const nearestPoint = sortedData.reduce((prev, curr) => {
      const prevX =
        ((prev.timestamp - timeRange.startTime) / timeRange.duration) *
          rInnerWidth.value +
        horizontalPadding
      const currX =
        ((curr.timestamp - timeRange.startTime) / timeRange.duration) *
          rInnerWidth.value +
        horizontalPadding
      return Math.abs(prevX - x) < Math.abs(currX - x) ? prev : curr
    })
    const index = sortedData.findIndex(d => d === nearestPoint)

    return index
  }, [touchedPoint, rInnerWidth])

  const [touchedLabels, setTouchedLabels] = useState<{
    time: {
      x: number
      paragraph: SkParagraph
      width: number
    }
    lessons: {
      x: number
      y: number
      paragraph: SkParagraph
      width: number
    }
  } | null>(null)

  // TODO: it looks like this reaction breaks gestures after hot-reload.
  useAnimatedReaction(
    () => touchedTimeLabelIndex.value,
    (cur, prev) => {
      // console.log('reaction')
      if (cur !== prev && cur !== null) {
        runOnJS(setTouchedLabels)(allLabels[cur])
      }
    },
  )

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
      if (index > 0 && point.lessons !== sortedData[index - 1].lessons) {
        acc.push(point)
      }
      return acc
    }, [] as LessonData[])
  }, [sortedData])

  const touchX = useDerivedValue(
    () => touchedPoint?.value?.x ?? 0,
    [touchedPoint],
  )
  const touchY = useDerivedValue(
    () => touchedPoint?.value?.y ?? 0,
    [touchedPoint],
  )
  const animatedRadius = useDerivedValue(() => {
    return withSpring(hasTouch.value ? 6 : 0, {
      stiffness: hasTouch.value ? 1000 : 100,
      damping: hasTouch.value ? 1000 : 10,
    })
  }, [hasTouch])
  const hasTouchOpaque = useDerivedValue(
    () => (hasTouch.value ? 1.0 : 0.0),
    [hasTouch],
  )
  const hasNoTouchOpaque = useDerivedValue(
    () => (hasTouch.value ? 0.0 : 1.0),
    [hasTouch],
  )

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width)
    },
    [setWidth],
  )

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1, minHeight: height }} onLayout={handleLayout}>
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
        <Group layer={<Paint opacity={hasTouchOpaque} />}>
          {touchedLabels && (
            <>
              <Paragraph
                key='lessons'
                paragraph={touchedLabels.lessons.paragraph}
                x={touchedLabels.lessons.x}
                y={touchedLabels.lessons.y - 20 - 8}
                width={touchedLabels.lessons.width + 1}
              />
              {/* debug line */
              /*<Line
                  p1={vec(
                    touchedLabels.time.x + touchedLabels.time.width / 2,
                    0,
                  )}
                  p2={vec(
                    touchedLabels.time.x + touchedLabels.time.width / 2,
                    300,
                  )}
                />*/}
              <Paragraph
                key='time'
                paragraph={touchedLabels.time.paragraph}
                x={touchedLabels.time.x}
                y={innerHeight + labelSize - 4}
                width={touchedLabels.time.width + 1}
              />
            </>
          )}
        </Group>
        <Group layer={<Paint opacity={hasNoTouchOpaque} />}>
          {timeLabels.map((label, index) => {
            const width = label.paragraph.getLongestLine() + 1
            return (
              <Paragraph
                key={label.x}
                paragraph={label.paragraph}
                x={label.x - width / 2}
                y={innerHeight + labelSize - 4}
                width={width}
              />
            )
          })}
        </Group>
        <Circle cx={touchX} cy={touchY} r={animatedRadius} color={lineColor} />
      </Canvas>
    </GestureDetector>
  )
}

export default Chart
