import axios from 'axios'
import { Assignment } from '../types/assignment'
import { SubjectType } from '../types/subject'
import { Review } from '../types/review'
import { CreateReviewParams } from '../types/createReviewParams'
import { ReviewStatistic } from '../types/reviewStatistic'
import { User } from '../types/user'
import { Preferences } from '../types/preferences'

const API_BASE_URL = 'https://api.wanikani.com/v2'

// TODO: maybe refactor in future to look more like a data source which is
// injected to redux store?
//
// TODO: add api key verification (by making empty request to server) to check
// permissions and disable app's features if not authorized.
let apiKey: string | undefined
const setApiKey = (key: string) => {
  apiKey = key
}
const getApiKey = () => apiKey

const http = axios.create({})
http.interceptors.request.use(
  config => {
    config.headers.Authorization = `Bearer ${apiKey}`
    config.headers['Wanikani-Revision'] = '20170710'
    return config
  },
  error => {
    console.error(error)
    return Promise.reject(error)
  },
)
http.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        'Error response: ',
        error.response.data,
        ' status: ',
        error.response.status,
        ' headers: ',
        error.response.headers,
      )
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('No response received: ', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Unknown network error: ', error.message)
    }
    console.log(error.config)
    return Promise.reject(error)
  },
)

const fetchLessons = async (): Promise<Assignment[]> => {
  const response = await http.get<ApiResponse<ApiResponse<Assignment>[]>>(
    `${API_BASE_URL}/assignments?immediately_available_for_lessons=true`,
  )
  return response.data.data.map(el => ({ ...el.data, id: el.id }))
}

const fetchReviews = async (): Promise<Assignment[]> => {
  const response = await http.get<ApiResponse<ApiResponse<Assignment>[]>>(
    `${API_BASE_URL}/assignments?immediately_available_for_review=true`,
  )
  return response.data.data.map(el => ({ ...el.data, id: el.id }))
}

const fetchSubject = async (id: number): Promise<SubjectType> => {
  const response = await http.get<ApiResponse<SubjectType>>(
    `${API_BASE_URL}/subjects/${id}`,
  )
  const type = response.data.object
  if (isValidSubjectType(type)) {
    return {
      ...response.data.data,
      id: response.data.id,
      type,
    } as SubjectType
  }

  throw `object field used for determining type of subject is wrong. object: ${type}`
}

const fetchSubjects = async (ids: number[]): Promise<SubjectType[]> => {
  const response = await http.get<ApiResponse<ApiResponse<SubjectType>[]>>(
    `${API_BASE_URL}/subjects/`,
    {
      params: { ids: ids.join(',') },
    },
  )

  return response.data.data
    .map(el => {
      const type = el.object
      if (isValidSubjectType(type)) {
        return { ...el.data, id: el.id, type } as SubjectType
      } else {
        console.error('Unknown subject type: ', type)
        return undefined
      }
    })
    .filter((el): el is SubjectType => el !== undefined)
}

const startAssignment = async (id: number): Promise<Assignment> => {
  const response = await http.put<ApiResponse<Assignment>>(
    `${API_BASE_URL}/assignments/${id}/start`,
  )
  return { ...response.data.data, id: response.data.id }
}

const createReview = async (
  params: CreateReviewParams,
): Promise<[Review, CreateReviewResourcesUpdated]> => {
  const response = await http.post<CreateReviewApiResponse>(
    `${API_BASE_URL}/reviews`,
    { review: params },
  )
  return [response.data.data, response.data.resources_updated]
}

const fetchSettings = async (): Promise<User> => {
  const response = await http.get<ApiResponse<User>>(`${API_BASE_URL}/user`)
  return response.data.data
}

const updateSettings = async (params: Preferences): Promise<User> => {
  const response = await http.put<ApiResponse<User>>(`${API_BASE_URL}/user`, {
    user: { preferences: params },
  })
  return response.data.data
}

/**
 * Checks if a given type is a valid SubjectType.
 *
 * @param type - The type to check.
 * @returns True if the type is one of 'radical', 'kanji', 'vocabulary', or 'kana_vocabulary'.
 */
function isValidSubjectType(
  type: string,
): type is 'radical' | 'kanji' | 'vocabulary' | 'kana_vocabulary' {
  return ['radical', 'kanji', 'vocabulary', 'kana_vocabulary'].includes(type)
}

export const WaniKaniApi = {
  fetchLessons: fetchLessons,
  fetchSubject: fetchSubject,
  fetchSubjects: fetchSubjects,
  startAssignment: startAssignment,
  createReview: createReview,
  fetchReviews: fetchReviews,

  fetchSettings: fetchSettings,
  updateSettings: updateSettings,

  setApiKey: setApiKey,
  getApiKey: getApiKey,
}

interface ApiResponse<T> {
  id: number
  object: 'assignment' | string
  url: string
  data_updated_at: Date | null
  data: T
}

interface CreateReviewApiResponse {
  id: number
  object: 'assignment' | string
  url: string
  data_updated_at: Date | null
  data: Review
  resources_updated: CreateReviewResourcesUpdated
}

interface CreateReviewResourcesUpdated {
  assignment: Assignment
  review_statistic: ReviewStatistic
}
