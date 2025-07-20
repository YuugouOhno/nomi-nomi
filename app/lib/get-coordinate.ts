import { config } from 'dotenv';
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';

config({ path: '.env.local' });

const googleMapsClient = new GoogleMapsClient({});
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

/**
 * 地名から緯度・経度を取得
 * @param address 例: "渋谷駅"
 * @returns { lat: number, lng: number } または null（見つからない場合）
 */
async function getCoordinatesFromAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    const res = await googleMapsClient.geocode({
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
        language: 'ja',
      },
    });

    const location = res.data.results[0]?.geometry.location;
    if (location) {
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.warn(`❗️「${address}」に対する座標が見つかりませんでした`);
      return null;
    }
  } catch (error) {
    console.error('❌ Geocoding API エラー:', error);
    return null;
  }
}

// 使用例
(async () => {
  const location = await getCoordinatesFromAddress('皇居');
  if (location) {
    console.log('緯度:', location.lat);
    console.log('経度:', location.lng);
  }
})();