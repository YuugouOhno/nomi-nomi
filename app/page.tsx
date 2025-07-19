"use client";

import { useState } from "react";
import { SearchBox } from "./components/SearchBox";
import { SearchResults } from "./components/SearchResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Restaurant } from "./types";
import Link from "next/link";

import { AIConversationLayout } from "@/app/components/AIConversationLayout";

export default function Home() {
  const [results, setResults] = useState<Restaurant[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setRecommendation("");

    
    // --- 実際のAPIを呼び出す場合 ---
    console.log("/api/searchの呼び出し")
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("検索に失敗しました。もう一度お試しください。");
      }

      const data = await response.json();
      setRecommendation(data.message);
      // TODO: data.restaurants にはIDしか入っていないので、
      // 本来はIDを元にレストラン情報を取得する処理が必要
      setResults(data.restaurants);
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

      {results.length > 0 && <SearchResults results={results} />}

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
