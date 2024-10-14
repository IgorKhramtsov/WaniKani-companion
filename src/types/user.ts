import { Preferences } from './preferences'
import { Subscription } from './subscription'

/**
 * User Data Structure
 */
export interface User {
  /**
   * If the user is on vacation, this will be the timestamp of when that vacation started.
   * If the user is not on vacation, this is null.
   */
  current_vacation_started_at: number | null

  /**
   * The current level of the user. This ignores subscription status.
   */
  level: number

  /**
   * User settings specific to the WaniKani application.
   */
  preferences: Preferences

  /**
   * The URL to the user's public facing profile page.
   */
  profile_url: string

  /**
   * The signup date for the user.
   */
  started_at: number

  /**
   * Details about the user's subscription state.
   */
  subscription: Subscription

  /**
   * The user's username.
   */
  username: string
}
