'use client'

import { Card, CardHeader, CardContent } from '@/app/components/ui/Card'
import { Icon } from '@/app/components/ui/Icon'
import { SearchResult } from '@/app/types'

interface SearchResultsProps {
  results: SearchResult[]
  isLoading?: boolean
  error?: string | null
}

export function SearchResults({ results, isLoading, error }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="ArrowPathIcon" size="lg" className="animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">検索中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="ExclamationCircleIcon" size="lg" className="text-red-600" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="MagnifyingGlassIcon" size="lg" className="text-gray-400" />
        <span className="ml-2 text-gray-600">検索結果がありません</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.izakaya.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {result.izakaya.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {result.izakaya.address}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="StarIcon" size="sm" className="text-yellow-500" solid />
                <span className="text-sm font-medium">
                  {result.izakaya.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({result.izakaya.totalReviews}件)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Icon name="CurrencyYenIcon" size="sm" className="mr-1" />
                <span>{getPriceRangeText(result.izakaya.priceRange)}</span>
              </div>
              {result.izakaya.hasPrivateRoom && (
                <div className="flex items-center">
                  <Icon name="BuildingOfficeIcon" size="sm" className="mr-1" />
                  <span>個室あり</span>
                </div>
              )}
            </div>
            
            {result.matchedKeywords.length > 0 && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  マッチしたキーワード:
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.matchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-700">{result.explanation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getPriceRangeText(priceRange: string | null | undefined): string {
  switch (priceRange) {
    case 'LOW':
      return '¥ - リーズナブル'
    case 'MEDIUM':
      return '¥¥ - 中価格帯'
    case 'HIGH':
      return '¥¥¥ - 高価格帯'
    default:
      return '価格帯不明'
  }
}