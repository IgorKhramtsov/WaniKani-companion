import React, { useEffect, useState } from 'react'

type FetchResult<T> = { data: T | undefined; isLoading: boolean }

export const useAsyncFetch = <T>(
  fetchFunc: () => Promise<T>,
  skip: boolean = false,
): FetchResult<T> => {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const fetchFuncRef = React.useRef(fetchFunc)
  fetchFuncRef.current = fetchFunc

  useEffect(() => {
    if (skip) return

    setIsLoading(true)
    const fetch = async () => {
      const data = await fetchFuncRef.current()
      console.log('[useAsyncFetch]: fetch done')
      setData(data)
      setIsLoading(false)
    }

    fetch().catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [skip, setIsLoading, setData])

  return { data, isLoading }
}
