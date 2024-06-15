import { Radical } from '@/src/types/radical'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'
import { SubjectType } from '@/src/types/subject'

export interface EnrichedSubject {
  subject: SubjectType
  radicals: Radical[]
  kanji: Kanji[]
  vocabulary: Vocabulary[]
}
