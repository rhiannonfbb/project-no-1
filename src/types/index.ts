export type IdeaStatus = 'new' | 'planned' | 'in_progress' | 'done'
export type SortOption = 'score' | 'newest' | 'oldest'
export type Locale = 'de' | 'en'

export interface IdeaTranslation {
  title: string
  description: string
}

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  status: IdeaStatus
  score: number
  original_language: string | null
  translations: Record<string, IdeaTranslation> | null
  created_at: string
  updated_at: string
}

export interface UserVotes {
  [ideaId: string]: 1 | -1
}
