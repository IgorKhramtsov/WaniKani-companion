import { Middleware } from '@reduxjs/toolkit'
import { wanikaniApi } from '../api/wanikaniApi'
import { localDbApi } from '../api/localDb/api'
import { AppDispatch } from '../redux/store'
import { localDbAssignmentsApi } from './localDb/assignment'

export const localDbSyncMiddleware: Middleware =
  api => next => async action => {
    const dispatch = api.dispatch as AppDispatch

    if (wanikaniApi.endpoints.createReview.matchFulfilled(action)) {
      console.log('createReview fulfilled')
      const [review, { assignment, review_statistic }] = action.payload
      dispatch(
        localDbAssignmentsApi.endpoints.saveAssignments.initiate([assignment]),
      )
      dispatch(
        localDbApi.endpoints.saveReviewStatistics.initiate([review_statistic]),
      )
      dispatch(localDbApi.endpoints.saveReviews.initiate([review]))
    }

    if (wanikaniApi.endpoints.startAssignment.matchFulfilled(action)) {
      const assignment = action.payload
      dispatch(
        localDbAssignmentsApi.endpoints.saveAssignments.initiate([assignment]),
      )
    }

    if (wanikaniApi.endpoints.createStudyMaterial.matchFulfilled(action)) {
      const studyMaterial = action.payload
      dispatch(
        localDbApi.endpoints.saveStudyMaterials.initiate([studyMaterial]),
      )
    }
    if (wanikaniApi.endpoints.updateStudyMaterial.matchFulfilled(action)) {
      const studyMaterial = action.payload
      dispatch(
        localDbApi.endpoints.saveStudyMaterials.initiate([studyMaterial]),
      )
    }

    return next(action)
  }
