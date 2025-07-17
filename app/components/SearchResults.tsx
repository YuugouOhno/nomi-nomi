'use client';

import { Restaurant } from '@/app/types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface SearchResultsProps {
  message: string;
  restaurants: Restaurant[];
}

export function SearchResults({ message, restaurants }: SearchResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 推薦メッセージ */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">おすすめ</h2>
        <p className="text-blue-800 leading-relaxed">{message}</p>
      </div>

      {/* レストラン一覧 */}
      <div className="grid gap-4 md:grid-cols-2">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
        <p className="text-sm text-gray-600">{restaurant.area}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {restaurant.description && (
            <p className="text-gray-700 text-sm">{restaurant.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine.map((cuisine) => (
              <span
                key={cuisine}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {cuisine}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{restaurant.address}</span>
            {restaurant.ratingAverage && (
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{restaurant.ratingAverage.toFixed(1)}</span>
                {restaurant.ratingCount && (
                  <span className="ml-1">({restaurant.ratingCount})</span>
                )}
              </div>
            )}
          </div>

          {restaurant.priceCategory && (
            <div className="text-sm text-gray-600">
              価格帯: {restaurant.priceCategory}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}