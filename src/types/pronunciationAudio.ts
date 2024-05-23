/**
 * Represents pronunciation audio for a vocabulary or kana vocabulary subject.
 */
export interface PronunciationAudio {
  /**
   * The location of the audio.
   */
  url: string;
  
  /**
   * The content type of the audio. Currently the API delivers audio/mpeg and audio/ogg.
   */
  content_type: 'audio/mpeg' | 'audio/ogg' | 'audio/webm';
  
  /**
   * Details about the pronunciation audio.
   */
  metadata: {
    /**
     * The gender of the voice actor.
     */
    gender: 'male' | 'female';
    
    /**
     * A unique ID shared between the same source pronunciation audio.
     */
    source_id: number;
    
    /**
     * Vocabulary being pronounced in kana.
     */
    pronunciation: string;
    
    /**
     * A unique ID belonging to the voice actor.
     */
    voice_actor_id: number;
    
    /**
     * Humanized name of the voice actor.
     */
    voice_actor_name: string;
    
    /**
     * Description of the voice.
     */
    voice_description: string;
  };
}

