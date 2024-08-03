import { useEffect, useState } from 'react'

type FetchResult<T> = { data: T | undefined; isLoading: boolean }

export const useAsyncFetch = <T>(
  fetchFunc: () => Promise<T>,
  skip: boolean = false,
): FetchResult<T> => {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('[useAsyncFetch]: useEffect: fetchFunc')
  }, [fetchFunc])

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
