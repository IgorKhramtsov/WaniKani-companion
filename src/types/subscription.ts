/**
 * Subscription Object Attributes
 */
export interface Subscription {
  /**
   * Whether or not the user currently has a paid subscription.
   */
  active: boolean

  /**
   * The maximum level of content accessible to the user for lessons, reviews, and content review.
   * For unsubscribed/free users, the maximum level is 3. For subscribed users, this is 60.
   * Any application that uses data from the WaniKani API must respect these access limits.
   */
  max_level_granted: number

  /**
   * The date when the user's subscription period ends.
   * If the user has subscription type lifetime or free then the value is null.
   */
  period_ends_at: number | null

  /**
   * The type of subscription the user has. Options are following: free, recurring, and lifetime.
   */
  type: 'free' | 'recurring' | 'lifetime'
}
