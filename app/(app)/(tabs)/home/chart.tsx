import React, { Fragment, useMemo } from 'react'
import { Dimensions } from 'react-native'
import {
  Canvas,
  Path,
  Skia,
  Circle,
  Text,
  matchFont,
  Color,
  vec,
  LinearGradient,
  PaintStyle,
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
  const font = matchFont(
    {
      ...typography.label,
      fontFamily: 'Noto Sans',
    },
    Skia.FontMgr.System(),
  )
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
      const x =
        ((point.timestamp - timeRange.startTime) / timeRange.duration) * width
      const y =
        height -
        (point.lessons / Math.max(...data.map(d => d.lessons))) * height
      if (index === 0) {
        skPath.moveTo(x, y)
      } else {
        const prevX =
          ((sortedData[index - 1].timestamp - timeRange.startTime) /
            timeRange.duration) *
          width
        const prevY =
          height -
          (sortedData[index - 1].lessons /
            Math.max(...data.map(d => d.lessons))) *
            height
        const midX = (prevX + x) / 2
        skPath.cubicTo(midX, prevY, midX, y, x, y)
      }
    })
    return skPath
  }, [data, sortedData, width, height, timeRange])

  const fillPath = useMemo(() => {
    const skPath = path.copy()
    skPath.lineTo(width, height)
    skPath.lineTo(0, height)
    skPath.close()
    return skPath
  }, [path, width, height])

  const timeLabels = useMemo(() => {
    return Array.from({ length: labelCount }, (_, i) => {
      const timestamp =
        timeRange.startTime + (i / (labelCount - 1)) * timeRange.duration
      const date = new Date(timestamp)
      const hour = date.getHours()
      const x = (i / (labelCount - 1)) * width
      return { hour, x }
    })
  }, [labelCount, width, timeRange])

  const updateTouchedPoint = (x: number) => {
    const nearestPoint = sortedData.reduce((prev, curr) => {
      const prevX =
        ((prev.timestamp - timeRange.startTime) / timeRange.duration) * width
      const currX =
        ((curr.timestamp - timeRange.startTime) / timeRange.duration) * width
      return Math.abs(prevX - x) < Math.abs(currX - x) ? prev : curr
    })
    touchedPoint.value = {
      x:
        ((nearestPoint.timestamp - timeRange.startTime) / timeRange.duration) *
        width,
      y:
        height -
        (nearestPoint.lessons / Math.max(...data.map(d => d.lessons))) * height,
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
            end={vec(0, height)}
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
            width
          const y =
            height -
            (point.lessons / Math.max(...data.map(d => d.lessons))) * height
          // Paint for the fill
          const fillPaint = Skia.Paint()
          fillPaint.setStyle(PaintStyle.Fill) // Set the style to fill
          fillPaint.setColor(Skia.Color(lineColor)) // Set fill color (green)

          // Paint for the stroke
          const strokePaint = Skia.Paint()
          strokePaint.setStyle(PaintStyle.Stroke) // Set the style to stroke
          strokePaint.setStrokeWidth(3) // Set stroke width
          strokePaint.setColor(Skia.Color(bgColor)) // Set stroke color (red)

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
        {timeLabels.map(({ hour, x }) => (
          <Text
            key={hour}
            x={x}
            y={height + 20}
            text={`${hour}:00`}
            font={font}
            color='black'
          />
        ))}
        {<Circle cx={circleX} cy={circleY} r={animatedRadius} color='blue' />}
      </Canvas>
    </GestureDetector>
  )
}

export default Chart
