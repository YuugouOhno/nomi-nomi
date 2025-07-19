"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  area: string;
  cuisine: string | string[];
  features: string[];
  ambience: string | string[];
  rating?: number;
  ratingAverage?: number;
  priceRange?: string;
  priceCategory?: string;
  openingHours: string | Record<string, { open: string; close: string }>;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        setRestaurants(data.restaurants);
      } catch (err) {
        console.error('Restaurants fetch error:', err);
        setError('レストラン一覧の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">レストラン一覧</h1>
          <p className="text-xl text-gray-600 mb-6">登録されているレストラン ({restaurants.length}件)</p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            検索ページに戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
                <p className="text-gray-600 mb-3 text-sm">{restaurant.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">住所:</span>
                    <span className="ml-2">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">エリア:</span>
                    <span className="ml-2">{restaurant.area}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">料理:</span>
                    <span className="ml-2">
                      {Array.isArray(restaurant.cuisine) 
                        ? restaurant.cuisine.join('、') 
                        : restaurant.cuisine}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">価格帯:</span>
                    <span className="ml-2">{restaurant.priceRange || restaurant.priceCategory || '¥¥'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">評価:</span>
                    <span className="ml-2">{restaurant.rating || restaurant.ratingAverage || 0}/5</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">営業時間:</span>
                    <span className="ml-2">
                      {typeof restaurant.openingHours === 'string' 
                        ? restaurant.openingHours 
                        : '月-木 17:00-23:00'}
                    </span>
                  </div>
                </div>

                {restaurant.features && restaurant.features.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700 text-sm">特徴:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {restaurant.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">雰囲気:</span>
                  <span className="ml-2">
                    {Array.isArray(restaurant.ambience) 
                      ? restaurant.ambience.join('、') 
                      : restaurant.ambience}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 開発者用リンク */}
      <div className="fixed bottom-4 right-4">
        <Link 
          href="/admin/restaurants"
          className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          管理ページ
        </Link>
      </div>
    </main>
  );
}