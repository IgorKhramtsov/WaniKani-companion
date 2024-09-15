import { useMemo } from 'react'
import { useGetAssignmentsQuery } from '../api/localDbApi'
import { useHourlyTriggerOnRoundHour } from './useHourlyTrigger'

export const useForecast = () => {
  const { isLoading, data: assignments } = useGetAssignmentsQuery()

  const reviewAssignments = useMemo(
    () =>
      assignments
        ?.filter(a => a.srs_stage > 0)
        .map(e => Object.assign({}, e)) // Copy to make mutable
        .map(e => {
          e.available_at_date = !!e.available_at
            ? new Date(e.available_at)
            : null
          return e
        }) ?? [],
    [assignments],
  )
  reviewAssignments?.sort((a, b) => {
    return (
      (a?.available_at_date?.valueOf() ?? 0) -
      (b?.available_at_date?.valueOf() ?? 0)
    )
  })
  const currentTime = useHourlyTriggerOnRoundHour()
  const notAvailableYet = useMemo(
    () =>
      reviewAssignments.filter(
        e => (e.available_at_date?.valueOf() ?? 0) > currentTime.valueOf(),
      ),
    [reviewAssignments, currentTime],
  )
  const timeInAWeek = useMemo(
    () => new Date().setDate(new Date().getDate() + 7),
    [],
  )
  const availableDuringTheWeek = useMemo(
    () =>
      notAvailableYet.filter(
        e => (e.available_at_date?.valueOf() ?? 0) <= timeInAWeek.valueOf(),
      ),
    [notAvailableYet, timeInAWeek],
  )
  const forecast = useMemo(
    () =>
      availableDuringTheWeek.reduce(
        (acc, e) => {
          const date = e.available_at_date
          if (!date) return acc

          if (
            acc.length > 0 &&
            acc[acc.length - 1].date.valueOf() === date.valueOf()
          ) {
            acc[acc.length - 1].assignmentsCount++
            return acc
          } else {
            return [...acc, { date, assignmentsCount: 1 }]
          }
        },
        [] as { date: Date; assignmentsCount: number }[],
      ),
    [availableDuringTheWeek],
  )

  return {
    isLoading,
    availableRightNow: reviewAssignments.length - notAvailableYet.length,
    availableDuringTheWeek: availableDuringTheWeek.length,
    forecast,
  }
}
