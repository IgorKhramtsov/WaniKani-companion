import WidgetBridge from 'react-native-widget-bridge'
import { useEffect } from 'react'
import { useForecast } from './useForecast'

export const useWidgetPropagator = () => {
  const forecast = useForecast()

  useEffect(() => {
    if (forecast.isLoading) return

    WidgetBridge.reloadWidget('widget').catch(console.error)
  }, [forecast.isLoading, forecast.forecast, forecast.availableRightNow])
}
