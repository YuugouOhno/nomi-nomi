"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";

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

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    area: "",
    cuisine: "",
    features: "",
    ambience: "",
    priceCategory: "¥¥",
    openingHours: "11:00-22:00"
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingRestaurant ? 'PUT' : 'POST';
    const url = editingRestaurant 
      ? `/api/restaurants/${editingRestaurant.id}`
      : '/api/restaurants';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cuisine: formData.cuisine.split(',').map(c => c.trim()),
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
          ambience: formData.ambience.split(',').map(a => a.trim())
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      await fetchRestaurants();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      await fetchRestaurants();
    } catch (err) {
      console.error('Delete error:', err);
      alert('削除に失敗しました');
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      area: restaurant.area,
      cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine,
      features: restaurant.features.join(', '),
      ambience: Array.isArray(restaurant.ambience) ? restaurant.ambience.join(', ') : restaurant.ambience,
      priceCategory: restaurant.priceCategory || restaurant.priceRange || '¥¥',
      openingHours: typeof restaurant.openingHours === 'string' ? restaurant.openingHours : '11:00-22:00'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: "",
      description: "",
      address: "",
      area: "",
      cuisine: "",
      features: "",
      ambience: "",
      priceCategory: "¥¥",
      openingHours: "11:00-22:00"
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">レストラン管理</h1>
            <p className="text-gray-600">レストランの追加・編集・削除</p>
          </div>
          <div className="space-x-4">
            <Link 
              href="/restaurants"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              一覧ページに戻る
            </Link>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規追加
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  エリア
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  料理
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格帯
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                    <div className="text-sm text-gray-500">{restaurant.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {restaurant.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(restaurant.cuisine) 
                      ? restaurant.cuisine.join('、') 
                      : restaurant.cuisine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {restaurant.priceCategory || restaurant.priceRange || '¥¥'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingRestaurant ? 'レストラン編集' : 'レストラン新規追加'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    エリア *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    料理ジャンル（カンマ区切り） *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cuisine}
                    onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                    placeholder="日本料理, 寿司"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格帯
                  </label>
                  <select
                    value={formData.priceCategory}
                    onChange={(e) => setFormData({...formData, priceCategory: e.target.value})}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="¥">¥</option>
                    <option value="¥¥">¥¥</option>
                    <option value="¥¥¥">¥¥¥</option>
                    <option value="¥¥¥¥">¥¥¥¥</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特徴（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="個室あり, カウンター席, 駐車場あり"
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    雰囲気（カンマ区切り）
                  </label>
                  <input
                    type="text"
                    value={formData.ambience}
                    onChange={(e) => setFormData({...formData, ambience: e.target.value})}
                    placeholder="落ち着いた, モダン"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    営業時間
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingRestaurant ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}