export type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  area: string;
  latitude?: number;
  longitude?: number;
  cuisine: string[];
  priceMin?: number;
  priceMax?: number;
  priceCategory?: string;
  openingHours?: any;
  features: string[];
  ambience: string[];
  ratingAverage?: number;
  ratingCount?: number;
  images: string[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
};

export type SearchQuery = {
  id: string;
  rawQuery: string;
  structuredData?: any;
  keywords: string[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SearchResult = {
  message: string;
  restaurants: Restaurant[];
};