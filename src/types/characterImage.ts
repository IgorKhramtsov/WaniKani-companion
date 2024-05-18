/**
 * Represents an image of a radical character.
 */
export interface CharacterImage {
  /**
   * The location of the image.
   */
  url: string;
  
  /**
   * The content type of the image. The API only delivers image/svg+xml.
   */
  content_type: 'image/svg+xml';
  
  /**
   * Details about the image. Each content_type returns a uniquely structured object.
   */
  metadata: {
    /**
     * The SVG asset contains built-in CSS styling.
     * This is currently always set to true and exists for historical reasons only.
     */
    inline_styles: boolean;
  };
}

