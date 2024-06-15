export interface AnswerCheckResult {
  status: 'correct' | 'incorrect' | 'correctWithHint' | 'hint'
  message: string | undefined
}
