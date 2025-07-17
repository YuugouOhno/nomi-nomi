"use client";

import { SearchBox } from '@/app/components/SearchBox'
import { SearchResults } from '@/app/components/SearchResults'
import { useSearch } from '@/app/hooks/useSearch'
import { Icon } from '@/app/components/ui/Icon'
import Link from 'next/link'

export default function SearchPage() {
  const { searchResults, isLoading, error, search } = useSearch()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Icon name="BuildingStorefrontIcon" size="xl" className="text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">居酒屋レビュー検索</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            自然な言葉で居酒屋を検索できます。「新宿の個室がある居酒屋」「安くて美味しい焼き鳥屋」など、
            お好みの条件を入力してください。
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon name="ChatBubbleLeftRightIcon" size="sm" className="mr-2" />
              AIチャットで検索
            </Link>
            <span className="text-gray-500 py-2">または</span>
            <span className="text-gray-700 py-2">従来の検索を使用</span>
          </div>
        </div>

        <div className="mb-8">
          <SearchBox onSearch={search} isLoading={isLoading} />
        </div>

        <div className="max-w-4xl mx-auto">
          <SearchResults
            results={searchResults?.results || []}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </main>
  );
}