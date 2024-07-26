import { useEffect, useState } from 'react'

type FetchResult<T> = { data: T; isLoading: boolean }

export const useAsyncFetch = <T>(
  initialValue: T,
  fetchFunc: () => Promise<T>,
  skip: boolean = false,
): FetchResult<T> => {
  const [data, setData] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(false)

  // TODO: figure out why initialValue is always new
  // useEffect(() => {
  //   console.log('[useAsyncFetch]: useEffect initialValue')
  // }, [initialValue])
  //

  useEffect(() => {
    if (skip) return

    setIsLoading(true)
    const fetch = async () => {
      const data = await fetchFunc()
      console.log('[useAsyncFetch]: fetch done')
      setData(data)
      setIsLoading(false)
    }

    fetch().catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [skip, fetchFunc, setIsLoading, setData])

  return { data, isLoading }
}
