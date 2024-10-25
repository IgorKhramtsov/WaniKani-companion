import { Radical } from '@/src/types/radical'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'
import { Subject } from '@/src/types/subject'
import { StudyMaterial } from '@/src/types/studyMaterial'

export interface EnrichedSubject<T extends Subject = Subject> {
  subject: T
  studyMaterial?: StudyMaterial
  radicals: Radical[]
  kanji: Kanji[]
  vocabulary: Vocabulary[]
}
