import { useCallback, useEffect, useState } from 'react'

export const useHourlyTriggerOnRoundHour = () => {
  const [time, setTime] = useState(new Date())

  const callback = useCallback(() => {
    setTime(new Date())
  }, [])

  useEffect(() => {
    const getMillisecondsUntilNextHour = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0) // Set to the next full hour
      return nextHour.getTime() - now.getTime() // Return the difference in milliseconds
    }

    // Set timeout to trigger callback at the next round hour
    const timeoutId = setTimeout(() => {
      callback()

      // After the first execution, set up an interval to run every hour
      const intervalId = setInterval(() => {
        callback()
      }, 3600000) // 1 hour in milliseconds

      return () => clearInterval(intervalId)
    }, getMillisecondsUntilNextHour())

    // Cleanup the timeout on unmount
    return () => clearTimeout(timeoutId)
  }, [callback])

  return time
}
