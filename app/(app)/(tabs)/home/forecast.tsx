import { Text, View } from 'react-native'
import { useForecast } from '@/src/hooks/useForecast'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import Chart from './chart'

export const Forecast = () => {
  const { styles } = useStyles(stylesheet)
  const forecast = useForecast()

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
            color={Colors.white}
            height={170}
            labelsColor={Colors.white}
            lineColor={Colors.white}
            bgColor={Colors.blue}
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
    backgroundColor: Colors.blue,
    marginHorizontal: 20,
    borderRadius: 3,
  },
  title: {
    ...typography.titleC,
    color: Colors.white,
    paddingLeft: 20,
    paddingTop: 16,
  },
})
