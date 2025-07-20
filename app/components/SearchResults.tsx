import { Restaurant } from "../types";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { generateGoogleMapsLink } from '../lib/generate-link';

export function SearchResults({ results }: { results: Restaurant[] }) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center -m-8 p-8">
      {results.map((restaurant) => (
        <div key={restaurant.id} className="w-full sm:w-1/2 lg:w-1/3 p-8">
          <Card className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl flex flex-col bg-white h-full">
            <CardHeader className="p-0 border-b-0">
              <img 
                src={restaurant.images?.[0] || "/no-image.png"} 
                alt={restaurant.name} 
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{restaurant.name}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {restaurant.area && <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{restaurant.area}</span>}
                {restaurant.cuisine?.[0] && <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{restaurant.cuisine[0]}</span>}
                {restaurant.priceCategory && <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{restaurant.priceCategory}</span>}
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                {restaurant.description ? `${restaurant.description.substring(0, 80)}...` : 'お店の説明がありません。'}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-700 mt-auto pt-4 border-t border-gray-100">
                <span className="font-bold">{restaurant.ratingAverage ? `⭐ ${restaurant.ratingAverage}` : '評価なし'}</span>
                <a href={generateGoogleMapsLink(restaurant.name, restaurant.placeId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">詳細を見る</a>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}