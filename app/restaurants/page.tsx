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
  cuisine: string;
  features: string[];
  ambience: string;
  rating: number;
  priceRange: string;
  openingHours: string;
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
                    <span className="ml-2">{restaurant.cuisine}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">価格帯:</span>
                    <span className="ml-2">{restaurant.priceRange}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">評価:</span>
                    <span className="ml-2">{restaurant.rating}/5</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium">営業時間:</span>
                    <span className="ml-2">{restaurant.openingHours}</span>
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
                  <span className="ml-2">{restaurant.ambience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}