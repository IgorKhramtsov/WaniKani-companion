import WidgetBridge from 'react-native-widget-bridge'
import { useCallback, useEffect } from 'react'
import { useForecast } from './useForecast'

export const useWidgetPropagator = () => {
  const forecast = useForecast()

  const func = useCallback(async () => {
    if (forecast.isLoading) return

    await WidgetBridge.ensureUserDefaultsSuit('group.dev.khramtsov.wanikani')
    const dataToSet = {
      available: forecast.availableRightNow,
      forecast: forecast.forecast.map(e => ({
        date: e.date.toISOString(),
        reviews: e.assignmentsCount,
      })),
    }
    await WidgetBridge.setDict('forecast', dataToSet)
    console.log('Widget data set', dataToSet)
    const val = await WidgetBridge.getDict('forecast')
    console.log('Widget data get', val)
    await WidgetBridge.reloadWidget('widget')
  }, [forecast.isLoading, forecast.forecast, forecast.availableRightNow])

  useEffect(() => {
    func().catch(console.error)
  }, [func])
}
