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
    console.log("invoke response", json); // ←これを追加

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
      <div className="mt-12 p-4  bg-green-600 rounded-lg shadow">
         <h1 className="text-2xl font-bold mb-4">🔍 キーワード抽出（Claude）</h1>
      <textarea
        className="w-full border p-2 rounded"
        rows={5}
        placeholder="文章を入力してください"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleExtract}
        disabled={loading}
      >
        {loading ? '抽出中...' : '抽出する'}
      </button>

      {keywords.length > 0 && (
        <ul className="mt-4 list-disc pl-6">
          {keywords.map((kw, idx) => (
            <li key={idx}>{kw}</li>
          ))}
        </ul>
        )}
        </div>
    </div>
  );
}


// // app/page.tsx（例）
// // app/page.tsx（例）
// // 渋谷で安くておしゃれな居酒屋を探しています。個室があって、女性にも人気な店が理想です。

// // 'use client';

// // import { useState } from 'react';
// import 'dotenv/config';

// // export default function Home() {
//   const [input, setInput] = useState('');
//   const [keywords, setKeywords] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleExtract = async () => {
//     setLoading(true);

//     const response = await fetch('/api/invoke', {
//       method: 'POST',
//       body: JSON.stringify({
//         prompt: `以下の文章から重要なキーワードを5〜10個抽出してください。\n\n出力形式: {"keywords": ["..."]}\n\n文章:\n${input}`,
//       }),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const json = await response.json();

//     try {
//       const parsed = JSON.parse(json.result);
//       setKeywords(parsed.keywords || []);
//     } catch (e) {
//       console.error('JSONパース失敗:', json.result);
//     }

//     setLoading(false);
//   };

//   return (
//     <main className="p-4 max-w-xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">🔍 キーワード抽出（Claude）</h1>
//       <textarea
//         className="w-full border p-2 rounded"
//         rows={5}
//         placeholder="文章を入力してください"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//       />
//       <button
//         className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
//         onClick={handleExtract}
//         disabled={loading}
//       >
//         {loading ? '抽出中...' : '抽出する'}
//       </button>

//       {keywords.length > 0 && (
//         <ul className="mt-4 list-disc pl-6">
//           {keywords.map((kw, idx) => (
//             <li key={idx}>{kw}</li>
//           ))}
//         </ul>
//       )}
//     </main>
//   );
// }
