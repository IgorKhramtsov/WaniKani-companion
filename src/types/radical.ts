import { SubjectBase } from './subject'
import { CharacterImage } from './characterImage'

/**
 * Represents a radical in the WaniKani system.
 * A radical is a component used to build kanji characters.
 */
export interface Radical extends SubjectBase {
  type: 'radical'

  /**
   * An array of numeric identifiers for the kanji that have the radical as a component.
   */
  amalgamation_subject_ids: number[]

  /**
   * The UTF-8 characters for the radical.
   * Radicals can have a null value for characters if they are visually represented with an image instead.
   */
  characters: string | null

  /**
   * A collection of images of the radical.
   * Each character image object includes the URL, content type, and metadata about the image.
   */
  character_images: CharacterImage[]
}
