export function generateGoogleMapsLink(name: string, placeId: string): string {
  const encodedName = name.trim().replace(/\s+/g, '+');
  return `https://www.google.com/maps/search/?api=1&query=${encodedName}&query_place_id=${placeId}`;
}

// 使用例
const name2 = "ブラッスリー・ヴィロン 渋谷店";
const placeId = "ChIJZSSqcKmMGGARylOWxFCMqgE";
const link = generateGoogleMapsLink(name2, placeId);

console.log(link);