import { Fragment } from 'react'
import { Text, View } from 'react-native'
import { useForecast } from '@/src/hooks/useForecast'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CartesianChart, Area, Line, Scatter } from 'victory-native'
import { Colors } from '@/src/constants/Colors'
import { Skia, matchFont } from '@shopify/react-native-skia'
import typography from '@/src/constants/typography'
import tinycolor from 'tinycolor2'
import Chart from './chart'
import { useTheme } from '@react-navigation/native'

export const Forecast = () => {
  const theme = useTheme()
  const { styles } = useStyles(stylesheet)
  const forecast = useForecast()
  const font = matchFont(
    {
      ...typography.label,
      fontFamily: 'Noto Sans',
    },
    Skia.FontMgr.System(),
  )
  const forecastAcc = forecast.forecast.reduce(
    (acc, e) => {
      const lastReviewsCount =
        acc.length > 0 ? acc[acc.length - 1].assignmentsCount : 0
      const newE = {
        date: e.date,
        assignmentsCount: e.assignmentsCount + lastReviewsCount,
      }
      acc.push(newE)
      return acc
    },
    [] as { date: Date; assignmentsCount: number }[],
  )

  const forecastMap = forecast.forecast.reduce(
    (acc, e) => {
      acc[e.date.valueOf() / 1000] = e.assignmentsCount
      return acc
    },
    {} as Record<number, number>,
  )
  const now = new Date()
  const nowHourRounded = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
  )

  let acc = forecast.availableRightNow
  const areaChartData = Array.from({ length: 24 }, (_, index) => {
    const date = new Date(nowHourRounded.getTime() + index * 60 * 60 * 1000)
    const dateKey = date.valueOf() / 1000
    const value = forecastMap[dateKey] ?? 0
    acc += value
    return {
      date: date.valueOf(),
      value: acc,
      change: value,
    }
  })

  return (
    <View style={styles.view}>
      <Text style={styles.title}>Forecast</Text>
      {!forecast.isLoading && (
        <View style={{ flex: 1 }}>
          <Chart
            color={Colors.statisticsGreen}
            lineColor={Colors.statisticsGreenLine}
            bgColor={theme.colors.background ?? 'white'}
            labelCount={4}
            data={areaChartData.map(e => {
              return {
                timestamp: e.date,
                lessons: e.value,
              }
            })}
          />
        </View>
      )}
    </View>
  )
}

const stylesheet = createStyleSheet({
  view: {
    backgroundColor: 'white',
    marginHorizontal: 20,
  },
  title: {
    ...typography.titleC,
    paddingLeft: 20,
    paddingTop: 16,
  },
})
