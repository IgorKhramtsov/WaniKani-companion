import { useMutation, useQuery } from '@tanstack/react-query'
import { wkBaseUrl } from '../api/wanikaniApi'
import { useEffect, useMemo, useState } from 'react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { CreateReviewParams } from '../types/createReviewParams'

type ApiKeyVerificationResult = {
  allDataRead?: boolean
  assignmentsStart?: boolean
  reviewsCreate?: boolean
  studyMaterialsCreate?: boolean
  studyMaterialsUpdate?: boolean
  userUpdate?: boolean
}

export const useApiKeyVerifier = (apiKey?: string) => {
  const [verificationResult, setVerificationResult] =
    useState<ApiKeyVerificationResult>({})

  const subjects = useQuery({
    queryKey: ['subjects', apiKey],
    queryFn: () =>
      fetch(wkBaseUrl + 'subjects?ids=-1', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
    enabled: !!apiKey,
  })
  const { mutate: startAssignmentMutate, ...startAssignment } = useMutation({
    mutationKey: ['startAssignment'],
    mutationFn: async () =>
      fetch(wkBaseUrl + 'assignments/-1/start', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
  })
  const { mutate: createReviewMutate, ...createReview } = useMutation({
    mutationKey: ['createReview'],
    mutationFn: (params: CreateReviewParams) =>
      fetch(wkBaseUrl + 'reviews', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
  })
  const { mutate: setPreferencesMutate, ...setPreferences } = useMutation({
    mutationKey: ['preferences'],
    mutationFn: () =>
      fetch(wkBaseUrl + 'user', {
        method: 'PUT',
        body: JSON.stringify({ user: { preferences: {} } }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
  })
  // TODO: add study_materials create mutation
  // TODO: add study_materials update mutation

  const isLoading = useMemo(
    () =>
      !!apiKey &&
      (subjects.isLoading,
      startAssignment.isPending ||
        verificationResult?.assignmentsStart === undefined ||
        createReview.isPending ||
        verificationResult?.reviewsCreate === undefined ||
        setPreferences.isPending ||
        verificationResult?.userUpdate === undefined),
    [
      apiKey,
      createReview.isPending,
      setPreferences.isPending,
      startAssignment.isPending,
      subjects.isLoading,
      verificationResult?.assignmentsStart,
      verificationResult?.reviewsCreate,
      verificationResult?.userUpdate,
    ],
  )

  useEffect(() => {
    // Set only initial value (to prevent race conditions after mutation)
    setVerificationResult({})
  }, [setVerificationResult, apiKey])

  useEffect(() => {
    if (
      !!apiKey &&
      verificationResult &&
      verificationResult.assignmentsStart === undefined
    ) {
      startAssignmentMutate()
    }
  }, [apiKey, startAssignmentMutate, verificationResult])

  useEffect(() => {
    if (
      !!apiKey &&
      verificationResult &&
      verificationResult.userUpdate === undefined
    ) {
      console.log('setPreferencesMutate')
      setPreferencesMutate()
    }
  }, [apiKey, setPreferencesMutate, verificationResult])

  useEffect(() => {
    if (
      !!apiKey &&
      verificationResult &&
      verificationResult.reviewsCreate === undefined
    ) {
      createReviewMutate({
        subject_id: -1,
        incorrect_meaning_answers: 0,
        incorrect_reading_answers: 0,
      })
    }
  }, [apiKey, createReviewMutate, verificationResult])

  useEffect(() => {
    const testRes = subjects.error === null ? true : false

    if (verificationResult && verificationResult?.allDataRead === undefined) {
      setVerificationResult(
        prev =>
          prev && {
            ...prev,
            allDataRead: testRes,
          },
      )
    }
  }, [subjects.error, setVerificationResult, verificationResult])

  useEffect(() => {
    const testRes = isTokenError(startAssignment.data)
    if (testRes !== undefined) {
      setVerificationResult(
        prev =>
          prev && {
            ...prev,
            assignmentsStart: testRes,
          },
      )
    }
  }, [startAssignment.data, setVerificationResult])

  useEffect(() => {
    const testRes = isTokenError(createReview.data)
    if (testRes !== undefined) {
      setVerificationResult(
        prev =>
          prev && {
            ...prev,
            reviewsCreate: testRes,
          },
      )
    }
  }, [createReview.data, setVerificationResult])

  useEffect(() => {
    const testRes = isTokenError(setPreferences.data)
    if (testRes !== undefined) {
      setVerificationResult(
        prev =>
          prev && {
            ...prev,
            userUpdate: testRes,
          },
      )
    }
  }, [setPreferences.data, setVerificationResult])

  return { isLoading, verificationResult }
}

const isTokenError = (error: any) => {
  if (error && isNetworkError(error)) {
    const status = error.status
    if (status === 401) {
      return false
    } else if (
      typeof status === 'number' &&
      ((status >= 200 && status < 300) || (status > 401 && status < 500))
    ) {
      return true
    }
  }
}

const isNetworkError = (error: object): error is FetchBaseQueryError =>
  'status' in error
