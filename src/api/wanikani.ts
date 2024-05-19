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
  const response = await axios.get<ApiResponse<ApiResponse<Assignment>[]>>(
    `${API_BASE_URL}/assignments?immediately_available_for_lessons=true`,
    options
  )
  return response.data.data.map(el => el.data)
}

const fetchReviews = async (): Promise<Assignment[]> => {
  const response = await axios.get<ApiResponse<ApiResponse<Assignment>[]>>(
    `${API_BASE_URL}/assignments?immediately_available_for_review=true`,
    options
  )
  return response.data.data.map(el => el.data)
}

const fetchSubject = async (id: number): Promise<SubjectWithId> => {
  const response = await axios.get<ApiResponse<SubjectType>>(
    `${API_BASE_URL}/subjects/${id}`,
    options
  )
  const type = response.data.object
  if (isValidSubjectType(type)) {
    return { id: response.data.id, subject: { ...response.data.data, type } as SubjectType }
  }

  throw `object field used for determining type of subject is wrong. object: ${type}`
}

const fetchSubjects = async (ids: number[]): Promise<SubjectWithId[]> => {
  const response = await axios.get<ApiResponse<ApiResponse<SubjectType>[]>>(
    `${API_BASE_URL}/subjects/`,
    {
      ...options,
      params: { ids: ids.join(',') },
    },
  )

  return response.data.data.map(el => {
    const type = el.object
    if (isValidSubjectType(type)) {
      return { id: el.id, subject: { ...el.data, type } as SubjectType }
    }
    else {
      return undefined
    }
  }).filter((el): el is SubjectWithId => el !== undefined)
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

/**
 * Checks if a given type is a valid SubjectType.
 * 
 * @param type - The type to check.
 * @returns True if the type is one of 'radical', 'kanji', 'vocabulary', or 'kana_vocabulary'.
 */
function isValidSubjectType(type: string): type is 'radical' | 'kanji' | 'vocabulary' | 'kana_vocabulary' {
  return ['radical', 'kanji', 'vocabulary', 'kana_vocabulary'].includes(type);
}

export const WaniKaniApi = {
  fetchLessons: fetchLessons,
  fetchSubject: fetchSubject,
  fetchSubjects: fetchSubjects,
  startAssignment: startAssignment,
  createReview: createReview,
  fetchReviews: fetchReviews,
}

interface SubjectWithId {
  id: number
  subject: SubjectType
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

