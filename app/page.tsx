"use client";

import { useState } from "react";
import { SearchBox } from "./components/SearchBox";
import { SearchResults } from "./components/SearchResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Restaurant } from "./types";
import Link from "next/link";

import { 
  MultiLLMService, 
  searchRestaurantsIntegrated,
  LLMAResponse,
  LLMBResponse
} from "@/app/lib/multi-llm-service";

interface RestaurantSearchResult {
  restaurants: any[];
  llmCResponse?: string;
}

export default function Home() {
  const [results, setResults] = useState<Restaurant[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<RestaurantSearchResult | null>(null);

  //キーワード抽出
  const [input, setInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    setLoading(true);

    const response = await fetch('/api/invoke', {
      method: 'POST',
      body: JSON.stringify({
        prompt: `以下の文章から重要なキーワードを5〜10個抽出してください。\n\n出力形式: {"keywords": ["..."]}\n\n文章:\n${input}`,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    //console.log("invoke response", json); // ←これを追加

    try {
      const parsed = JSON.parse(json.result);
      setKeywords(parsed.keywords || []);
    } catch (e) {
      console.error('JSONパース失敗:', json.result);
    }

    setLoading(false);
  };


  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setRecommendation("");
    setSearchResults(null);

    try {
      // LLM_AとLLM_Bを並行実行
      const [llmAResponse, llmBResponse] = await Promise.all([
        MultiLLMService.queryLLMA(query),
        MultiLLMService.queryLLMB(query)
      ]);

      if (llmAResponse.success && llmBResponse.success) {
        // 統合検索を実行
        const searchResult = await searchRestaurantsIntegrated(
          llmAResponse.data as LLMAResponse,
          llmBResponse.data as LLMBResponse,
          query
        );

        setSearchResults(searchResult);

        // 推薦文を設定
        const recommendationText = searchResult.llmCResponse || 
          `${searchResult.restaurants.length}件のレストランが見つかりました。`;
        
        setRecommendation(recommendationText);
        setResults(searchResult.restaurants);
      } else {
        throw new Error("レストラン検索に失敗しました");
      }
    } catch (e: any) {
      console.error('検索エラー:', e);
      const errorMessage = e.message || "検索に失敗しました。もう一度お試しください。";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* --- 検索セクション --- */}
      <section className="text-center py-12 md:py-16 bg-white rounded-lg shadow-md mb-8 ">
        <div className="w-full px-4">
          <p className="text-gray-600 mb-8">
            「渋谷で個室のある居酒屋」のように、自由な言葉で話しかけてください。
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* --- 結果表示セクション --- */}
      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-500 my-8">{error}</p>}
      
      {recommendation && (
        <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg shadow">
          <h3 className="font-bold text-lg text-blue-900 mb-2">AIからの提案</h3>
          <p className="text-blue-800 leading-relaxed">{recommendation}</p>
        </div>
      )}

      {/* レストラン検索結果の表示 */}
      {searchResults && searchResults.restaurants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">🍽️ 検索結果（{searchResults.restaurants.length}件）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.restaurants.map((restaurant, index) => (
              <div 
                key={restaurant.id || index} 
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out hover:shadow-xl"
              >
                {/* レストラン名 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">
                    {restaurant.name}
                  </h3>
                  
                  {/* タグ */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.area && (
                      <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {restaurant.area}
                      </span>
                    )}
                    {restaurant.cuisine?.[0] && (
                      <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {restaurant.cuisine[0]}
                      </span>
                    )}
                    {restaurant.priceCategory && (
                      <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {restaurant.priceCategory}
                      </span>
                    )}
                  </div>
                  
                  {/* 説明 */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {restaurant.description 
                      ? `${restaurant.description.substring(0, 100)}...` 
                      : 'お店の説明がありません。'
                    }
                  </p>
                  
                  {/* 評価と価格 */}
                  <div className="flex justify-between items-center text-sm border-t pt-4">
                    <span className="font-bold text-yellow-600">
                      {restaurant.ratingAverage ? `⭐ ${restaurant.ratingAverage}` : '評価なし'}
                    </span>
                    {restaurant.priceMin && restaurant.priceMax && (
                      <span className="text-gray-600">
                        ¥{restaurant.priceMin} - ¥{restaurant.priceMax}
                      </span>
                    )}
                  </div>
                  
                  {/* 住所 */}
                  {restaurant.address && (
                    <p className="text-xs text-gray-500 mt-3">
                      📍 {restaurant.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 従来のSearchResultsコンポーネントも残す（フォールバック用） */}
      {!searchResults && results.length > 0 && <SearchResults results={results} />}

      <div className="text-center mt-12">
        <Link 
          href="/restaurants"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          レストラン一覧を見る
        </Link>
      </div>
    </div>
  );
}