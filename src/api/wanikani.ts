import axios from "axios"
import { Assignment } from "../types/assignment"
import { SubjectType } from "../types/subject"
import { Review } from "../types/review"
import { CreateReviewParams } from "../types/createReviewParams"
import { ReviewStatistic } from "../types/reviewStatistic"
import { API_TOKEN } from '../../config'

const API_BASE_URL = 'https://api.wanikani.com/v2'

const authHeaders = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Wanikani-Revision': '20170710'
}

const options = {
  headers: authHeaders,
}

const fetchLessons = async (): Promise<Assignment[]> => {
  const response = await axios.get<ApiResponse<Assignment[]>>(
    `${API_BASE_URL}/assignments?immediately_available_for_lessons=true`,
    options
  )
  return response.data.data
}

const fetchReviews = async (): Promise<Assignment[]> => {
  const response = await axios.get<ApiResponse<Assignment[]>>(
    `${API_BASE_URL}/assignments?immediately_available_for_review=true`,
    options
  )
  return response.data.data
}

const fetchSubject = async (id: number): Promise<SubjectType> => {
  const response = await axios.get<ApiResponse<SubjectType>>(
    `${API_BASE_URL}/subjects/${id}`,
    options
  )
  return response.data.data
}

const startAssignment = async (id: number): Promise<Assignment> => {
  const response = await axios.put<ApiResponse<Assignment>>(
    `${API_BASE_URL}/assignments/${id}/start`,
    options
  )
  return response.data.data
}

const createReview = async (params: CreateReviewParams): Promise<[Review, CreateReviewResourcesUpdated]> => {
  const response = await axios.post<CreateReviewApiResponse>(
    `${API_BASE_URL}/reviews`,
    params,
    options
  )
  return [response.data.data, response.data.resources_updated]
}

export const WaniKaniApi = {
  fetchLessons: fetchLessons,
  fetchSubject: fetchSubject,
  startAssignment: startAssignment,
  createReview: createReview,
  fetchReviews: fetchReviews,
}

interface ApiResponse<T> {
  id: number
  object: 'assignment' | string,
  url: string
  data_updated_at: Date | null
  data: T
}

interface CreateReviewApiResponse {
  id: number
  object: 'assignment' | string,
  url: string
  data_updated_at: Date | null
  data: Review,
  resources_updated: CreateReviewResourcesUpdated
}

interface CreateReviewResourcesUpdated {
  assignment: Assignment,
  review_statistic: ReviewStatistic
}

