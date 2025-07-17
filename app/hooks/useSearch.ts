'use client'

import { useState, useCallback } from 'react'
import { SearchResponse } from '@/app/types'

interface UseSearchReturn {
  searchResults: SearchResponse | null
  isLoading: boolean
  error: string | null
  search: (query: string) => Promise<void>
}

export function useSearch(): UseSearchReturn {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: 実際のAPIエンドポイントに置き換える
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('検索に失敗しました')
      }

      const data: SearchResponse = await response.json()
      setSearchResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    searchResults,
    isLoading,
    error,
    search
  }
}