import { useMemo } from 'react'
import { useHourlyTriggerOnRoundHour } from './useHourlyTrigger'
import { Assignment } from '../types/assignment'
import { useGetAssignmentsForForecastQuery } from '../api/localDb/assignment'

type ExtendedAssignment = Assignment & { available_at_date: Date | null }

export const useForecast = () => {
  const { isLoading, data: assignments } = useGetAssignmentsForForecastQuery()

  const reviewAssignments = useMemo(
    () =>
      (assignments ?? [])
        .map(e => Object.assign({}, e) as ExtendedAssignment) // Copy to make mutable
        .map(e => {
          e.available_at_date = !!e.available_at
            ? new Date(e.available_at * 1000)
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
