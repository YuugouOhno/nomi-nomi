export interface Izakaya {
  id: string
  name: string
  address: string
  phone?: string
  priceRange: 'LOW' | 'MEDIUM' | 'HIGH'
  hasPrivateRoom: boolean
  rating: number
  totalReviews: number
  googlePlaceId: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  izakayaId: string
  content: string
  rating: number
  keywords: string[]
  createdAt: string
  updatedAt: string
}

export interface SearchQuery {
  id: string
  query: string
  extractedKeywords: string[]
  extractedConditions: {
    priceRange?: 'LOW' | 'MEDIUM' | 'HIGH'
    hasPrivateRoom?: boolean
    minRating?: number
  }
  createdAt: string
}

export interface SearchResult {
  izakaya: Izakaya
  relevanceScore: number
  matchedKeywords: string[]
  explanation: string
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  query: SearchQuery
  suggestions?: {
    relaxedConditions?: string[]
    additionalFilters?: string[]
  }
}