import { Radical } from '@/src/types/radical'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'
import { Subject } from '@/src/types/subject'

export interface EnrichedSubject {
  subject: Subject
  radicals: Radical[]
  kanji: Kanji[]
  vocabulary: Vocabulary[]
}
