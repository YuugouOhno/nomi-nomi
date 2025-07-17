// テスト用のシードデータ
export const seedRestaurants = [
  {
    id: '1',
    name: '海鮮居酒屋 魚心',
    description: '新鮮な海鮮と豊富な日本酒が自慢の居酒屋。毎日市場から仕入れる新鮮な魚介類を使った料理が楽しめます。',
    address: '東京都渋谷区道玄坂1-5-8',
    area: '渋谷',
    cuisine: ['和食', '居酒屋', '海鮮'],
    features: ['個室あり', '飲み放題', '禁煙席あり'],
    ambience: ['カジュアル', '友人同士', '接待'],
    ratingAverage: 4.2,
    ratingCount: 245,
    priceCategory: '¥¥',
    openingHours: {
      monday: { open: '17:00', close: '23:00' },
      tuesday: { open: '17:00', close: '23:00' },
      wednesday: { open: '17:00', close: '23:00' },
      thursday: { open: '17:00', close: '23:00' },
      friday: { open: '17:00', close: '24:00' },
      saturday: { open: '17:00', close: '24:00' },
      sunday: { open: '17:00', close: '22:00' }
    },
    keywords: ['新鮮', '海鮮', '日本酒', '刺身', '個室']
  },
  {
    id: '2',
    name: 'ビストロ サクラ',
    description: 'フランス料理をカジュアルに楽しめるビストロ。デートや記念日にぴったりの落ち着いた雰囲気です。',
    address: '東京都渋谷区神南1-12-16',
    area: '渋谷',
    cuisine: ['フレンチ', 'ビストロ', '洋食'],
    features: ['デート向け', 'ワインバー', '個室あり'],
    ambience: ['ロマンチック', 'デート', '大人の雰囲気'],
    ratingAverage: 4.6,
    ratingCount: 158,
    priceCategory: '¥¥¥',
    openingHours: {
      monday: { open: '18:00', close: '23:00' },
      tuesday: { open: '18:00', close: '23:00' },
      wednesday: { open: '18:00', close: '23:00' },
      thursday: { open: '18:00', close: '23:00' },
      friday: { open: '18:00', close: '24:00' },
      saturday: { open: '18:00', close: '24:00' },
      sunday: { open: '17:00', close: '22:00' }
    },
    keywords: ['フレンチ', 'デート', 'ワイン', 'おしゃれ', 'ロマンチック']
  },
  {
    id: '3',
    name: 'ラーメン道場 極',
    description: '深夜まで営業する本格ラーメン店。とんこつベースの濃厚スープと自家製麺が自慢です。',
    address: '東京都渋谷区宇田川町13-8',
    area: '渋谷',
    cuisine: ['ラーメン', '中華', '麺類'],
    features: ['深夜営業', '一人席あり', 'カウンター席'],
    ambience: ['カジュアル', '一人でも', '学生向け'],
    ratingAverage: 4.1,
    ratingCount: 892,
    priceCategory: '¥',
    openingHours: {
      monday: { open: '11:00', close: '03:00' },
      tuesday: { open: '11:00', close: '03:00' },
      wednesday: { open: '11:00', close: '03:00' },
      thursday: { open: '11:00', close: '03:00' },
      friday: { open: '11:00', close: '05:00' },
      saturday: { open: '11:00', close: '05:00' },
      sunday: { open: '11:00', close: '24:00' }
    },
    keywords: ['ラーメン', '深夜', '一人', 'とんこつ', '学生']
  },
  {
    id: '4',
    name: '寿司割烹 銀座',
    description: '職人が握る本格江戸前寿司。最高級の食材を使用した贅沢な寿司コースが楽しめます。',
    address: '東京都渋谷区東1-3-1',
    area: '渋谷',
    cuisine: ['寿司', '和食', '高級料理'],
    features: ['カウンター席', '接待向け', '完全予約制'],
    ambience: ['高級', 'フォーマル', '接待', '特別な日'],
    ratingAverage: 4.8,
    ratingCount: 67,
    priceCategory: '¥¥¥¥',
    openingHours: {
      monday: { open: '17:00', close: '22:00' },
      tuesday: { open: '17:00', close: '22:00' },
      wednesday: { open: '17:00', close: '22:00' },
      thursday: { open: '17:00', close: '22:00' },
      friday: { open: '17:00', close: '22:00' },
      saturday: { open: '17:00', close: '22:00' },
      sunday: { open: '17:00', close: '21:00' }
    },
    keywords: ['寿司', '高級', '職人', '江戸前', '接待']
  },
  {
    id: '5',
    name: 'イタリアン カフェ プリマ',
    description: '本格的なイタリア料理をカジュアルに楽しめるカフェレストラン。ランチタイムも営業しています。',
    address: '東京都渋谷区神宮前4-5-6',
    area: '表参道',
    cuisine: ['イタリアン', '洋食', 'パスタ'],
    features: ['ランチ営業', 'テラス席', '女性向け'],
    ambience: ['カジュアル', '女子会', 'おしゃれ'],
    ratingAverage: 4.3,
    ratingCount: 324,
    priceCategory: '¥¥',
    openingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '21:00' }
    },
    keywords: ['イタリアン', 'パスタ', 'ランチ', '女子会', 'テラス']
  },
  {
    id: '6',
    name: '焼肉 牛角 新宿店',
    description: '新鮮な和牛を使用した焼肉店。各種コースや食べ放題メニューも充実しています。',
    address: '東京都新宿区新宿3-15-3',
    area: '新宿',
    cuisine: ['焼肉', '韓国料理', '肉料理'],
    features: ['食べ放題', '個室あり', '宴会向け'],
    ambience: ['カジュアル', 'グループ', '宴会'],
    ratingAverage: 4.0,
    ratingCount: 456,
    priceCategory: '¥¥',
    openingHours: {
      monday: { open: '17:00', close: '23:00' },
      tuesday: { open: '17:00', close: '23:00' },
      wednesday: { open: '17:00', close: '23:00' },
      thursday: { open: '17:00', close: '23:00' },
      friday: { open: '17:00', close: '24:00' },
      saturday: { open: '17:00', close: '24:00' },
      sunday: { open: '17:00', close: '22:00' }
    },
    keywords: ['焼肉', '和牛', '食べ放題', '宴会', 'グループ']
  },
  {
    id: '7',
    name: '蕎麦切り 手打ち庵',
    description: '手打ちそばの専門店。国産そば粉を使用し、毎日店内で手打ちしています。',
    address: '東京都新宿区神楽坂2-8-10',
    area: '神楽坂',
    cuisine: ['そば', '和食', '麺類'],
    features: ['手打ち', '国産そば粉', '一人席あり'],
    ambience: ['和風', '落ち着いた', '一人でも'],
    ratingAverage: 4.4,
    ratingCount: 189,
    priceCategory: '¥¥',
    openingHours: {
      monday: { open: '11:00', close: '21:00' },
      tuesday: { open: '11:00', close: '21:00' },
      wednesday: { open: '11:00', close: '21:00' },
      thursday: { open: '11:00', close: '21:00' },
      friday: { open: '11:00', close: '21:00' },
      saturday: { open: '11:00', close: '21:00' },
      sunday: { open: '11:00', close: '20:00' }
    },
    keywords: ['そば', '手打ち', '和風', '落ち着いた', '一人']
  },
  {
    id: '8',
    name: '中華料理 龍宮',
    description: '本格的な中華料理を提供する老舗レストラン。北京ダックや点心が人気です。',
    address: '東京都中央区銀座5-8-12',
    area: '銀座',
    cuisine: ['中華', '中国料理', '点心'],
    features: ['個室あり', '円卓', '宴会向け'],
    ambience: ['高級', '接待', 'グループ'],
    ratingAverage: 4.5,
    ratingCount: 278,
    priceCategory: '¥¥¥',
    openingHours: {
      monday: { open: '11:30', close: '22:00' },
      tuesday: { open: '11:30', close: '22:00' },
      wednesday: { open: '11:30', close: '22:00' },
      thursday: { open: '11:30', close: '22:00' },
      friday: { open: '11:30', close: '22:00' },
      saturday: { open: '11:30', close: '22:00' },
      sunday: { open: '11:30', close: '21:00' }
    },
    keywords: ['中華', '北京ダック', '点心', '老舗', '接待']
  }
];

// シードデータをフィルタリングする関数
export function filterRestaurants(criteria: {
  area?: string;
  cuisine?: string[];
  priceCategory?: string;
  keywords?: string[];
}) {
  return seedRestaurants.filter(restaurant => {
    // エリアフィルタ
    if (criteria.area && !restaurant.area.includes(criteria.area)) {
      return false;
    }

    // 料理タイプフィルタ
    if (criteria.cuisine && criteria.cuisine.length > 0) {
      if (!criteria.cuisine.some(c => restaurant.cuisine.includes(c))) {
        return false;
      }
    }

    // 価格帯フィルタ
    if (criteria.priceCategory && restaurant.priceCategory !== criteria.priceCategory) {
      return false;
    }

    // キーワードフィルタ
    if (criteria.keywords && criteria.keywords.length > 0) {
      const restaurantText = `${restaurant.name} ${restaurant.description} ${restaurant.keywords.join(' ')} ${restaurant.features.join(' ')} ${restaurant.ambience.join(' ')}`.toLowerCase();
      
      if (!criteria.keywords.some(keyword => 
        restaurantText.includes(keyword.toLowerCase())
      )) {
        return false;
      }
    }

    return true;
  });
}