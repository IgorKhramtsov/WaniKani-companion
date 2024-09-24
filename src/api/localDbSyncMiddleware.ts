import { Middleware } from '@reduxjs/toolkit'
import { wanikaniApi } from '../api/wanikaniApi'
import { localDbApi } from '../api/localDbApi'
import { AppDispatch } from '../redux/store'

export const localDbSyncMiddleware: Middleware =
  api => next => async action => {
    const dispatch = api.dispatch as AppDispatch

    if (wanikaniApi.endpoints.createReview.matchFulfilled(action)) {
      console.log('createReview fulfilled')
      const [review, { assignment, review_statistic }] = action.payload
      dispatch(localDbApi.endpoints.saveAssignments.initiate([assignment]))
      dispatch(
        localDbApi.endpoints.saveReviewStatistics.initiate([review_statistic]),
      )
      dispatch(localDbApi.endpoints.saveReview.initiate([review]))
    }

    if (wanikaniApi.endpoints.startAssignment.matchFulfilled(action)) {
      const assignment = action.payload
      dispatch(localDbApi.endpoints.saveAssignments.initiate([assignment]))
    }

    return next(action)
  }
