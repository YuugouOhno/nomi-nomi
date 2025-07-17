"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

import { SearchBox } from "./components/SearchBox";
import { SearchResults } from "./components/SearchResults";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SearchResult } from "./types";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        return;
      }

      // レストランデータを完全な形式に変換
      const completeRestaurants = result.restaurants.map((restaurant: any) => ({
        ...restaurant,
        images: restaurant.images || [],
        keywords: restaurant.keywords || [],
        createdAt: restaurant.createdAt || new Date().toISOString(),
        updatedAt: restaurant.updatedAt || new Date().toISOString(),
      }));

      setSearchResult({
        message: result.message,
        restaurants: completeRestaurants,
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('検索中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">nomi-nomi</h1>
          <p className="text-xl text-gray-600">AI駆動型レストラン検索</p>
        </div>

        <div className="mb-8">
          <SearchBox onSearch={handleSearch} loading={loading} />
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {searchResult && !loading && (
          <SearchResults 
            message={searchResult.message} 
            restaurants={searchResult.restaurants} 
          />
        )}
      </div>
    </main>
  );
}
