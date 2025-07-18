"use client";

import { useState } from "react";
import { SearchBox } from "./components/SearchBox";
import { SearchResults } from "./components/SearchResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Restaurant } from "./types";
import Link from "next/link";

// ==================================================================
// 開発用の設定
// trueにすると、APIを叩かずにダミーデータを表示します
const useDummyData = false;
// ==================================================================

const dummyRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "渋谷シーフード天国",
    description: "新鮮な海の幸をふんだんに使った料理が自慢。特に、日替わりのカルパッチョは絶品です。",
    area: "渋谷",
    cuisine: ["シーフード", "イタリアン"],
    priceCategory: "¥¥¥",
    ratingAverage: 4.5,
    images: ["/images/placeholder-1.jpg"],
  },
  {
    id: "2",
    name: "新宿モダン和食 KAI",
    description: "伝統的な和食に現代的なアレンジを加えた創作料理が楽しめます。落ち着いた雰囲気でデートに最適。",
    area: "新宿",
    cuisine: ["和食", "創作料理"],
    priceCategory: "¥¥¥¥",
    ratingAverage: 4.8,
    images: ["/images/placeholder-2.jpg"],
  },
  {
    id: "3",
    name: "銀座グリルマスター",
    description: "最高級の熟成肉を炭火でじっくりと焼き上げます。肉好きにはたまらない一軒。",
    area: "銀座",
    cuisine: ["ステーキ", "グリル"],
    priceCategory: "¥¥¥¥¥",
    ratingAverage: 4.7,
    images: ["/images/placeholder-3.jpg"],
  },
];

const dummyRecommendation = "お探しの条件にぴったりの、素晴らしいレストランを3軒見つけました。海の幸がお好きなら「渋谷シーフード天国」、モダンな和食で特別な時間を過ごしたいなら「新宿モダン和食 KAI」、そして最高級の肉料理を堪能したいなら「銀座グリルマスター」がおすすめです。";


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

    if (useDummyData) {
      // --- ダミーデータを使用する場合 ---
      console.log("Using dummy data for query:", query);
      setTimeout(() => {
        setRecommendation(dummyRecommendation);
        setResults(dummyRestaurants);
        setIsLoading(false);
      }, 1500); // 1.5秒の遅延をシミュレート
    } else {
      // --- 実際のAPIを呼び出す場合 ---
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
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* --- 検索セクション --- */}
      <section className="text-center py-12 md:py-16 bg-white rounded-lg shadow-md mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            AIが見つける、あなたにぴったりの一軒
          </h2>
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
