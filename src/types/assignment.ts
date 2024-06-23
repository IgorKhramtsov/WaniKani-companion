export interface Assignment {
  id: number;

  available_at: string | null;      // Timestamp when the related subject will be available in the user's review queue
  burned_at: string | null;         // Timestamp when the user reaches SRS stage 9 the first time
  created_at: string;               // Timestamp when the assignment was created
  hidden: boolean;                // Indicates if the associated subject has been hidden
  passed_at: string | null;         // Timestamp when the user reaches SRS stage 5 for the first time
  resurrected_at: string | null;    // Timestamp when the subject is resurrected
  srs_stage: number;              // The current SRS stage interval
  started_at: string | null;        // Timestamp when the user completes the lesson
  subject_id: number;             // Unique identifier of the associated subject
  subject_type: 'kana_vocabulary' | 'kanji' | 'radical' | 'vocabulary'; // The type of the associated subject
  unlocked_at: string | null;       // Timestamp when the related subject is made available in lessons
}
