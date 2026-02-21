export type IdeaStatus = 'new' | 'planned' | 'in_progress' | 'done'
export type SortOption = 'score' | 'newest' | 'oldest'

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string
  status: IdeaStatus
  score: number
  created_at: string
  updated_at: string
}

export interface UserVotes {
  [ideaId: string]: 1 | -1
}
