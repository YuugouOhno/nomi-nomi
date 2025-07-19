import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; // ← Amplifyの出力先。位置はプロジェクト構成に応じて調整

Amplify.configure(outputs); // ← 必須！

import { generateClient } from '@aws-amplify/api';
import { type Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

async function seedKeywordsAndKeywordRestaurants() {
  console.log('Seeding Keywords and KeywordRestaurants...');

  // Dummy Keywords
  const keywordsToSeed = [
    { keyword: 'Italian' },
    { keyword: 'Japanese' },
    { keyword: 'Spicy' },
    { keyword: 'Vegan' },
    { keyword: 'Family-friendly' },
  ];

  const createdKeywords: { id: string; keyword: string }[] = [];
  for (const kw of keywordsToSeed) {
    const { data: newKeyword } = await client.models.Keyword.create(kw);
    if (newKeyword) {
      createdKeywords.push(newKeyword);
      console.log(`Created Keyword: ${newKeyword.keyword} (ID: ${newKeyword.id})`);
    }
  }

  // Dummy Restaurants (minimal data for linking)
  const restaurantsToSeed = [
    {
      name: 'Pasta Paradise',
      description: 'Authentic Italian dishes.',
      address: '123 Main St',
      area: 'Downtown',
      cuisine: ['Italian'],
      openingHours: { Monday: '9am-5pm' },
    },
    {
      name: 'Sushi Heaven',
      description: 'Fresh sushi and sashimi.',
      address: '456 Oak Ave',
      area: 'Uptown',
      cuisine: ['Japanese'],
      openingHours: { Monday: '9am-5pm' },
    },
    {
      name: 'Curry House',
      description: 'Spicy Indian curries.',
      address: '789 Pine Ln',
      area: 'Midtown',
      cuisine: ['Indian'],
      openingHours: { Monday: '9am-5pm' },
    },
  ];

  const createdRestaurants: { id: string; name: string }[] = [];
  for (const rest of restaurantsToSeed) {
    const { data: newRestaurant } = await client.models.Restaurant.create(rest);
    if (newRestaurant) {
      createdRestaurants.push(newRestaurant);
      console.log(`Created Restaurant: ${newRestaurant.name} (ID: ${newRestaurant.id})`);
    }
  }

  // Link Keywords to Restaurants (KeywordRestaurant)
  const keywordRestaurantLinks = [
    { keyword: 'Italian', restaurantName: 'Pasta Paradise' },
    { keyword: 'Japanese', restaurantName: 'Sushi Heaven' },
    { keyword: 'Spicy', restaurantName: 'Curry House' },
    { keyword: 'Vegan', restaurantName: 'Pasta Paradise' }, // Example of a keyword linked to multiple restaurants
  ];
  
  for (const link of keywordRestaurantLinks) {
    const keyword = createdKeywords.find(kw => kw.keyword === link.keyword);
    const restaurant = createdRestaurants.find(rest => rest.name === link.restaurantName);

    if (keyword && restaurant) {
      const { data: newLink } = await client.models.KeywordRestaurant.create({
        keywordId: keyword.id,
        restaurantId: restaurant.id,
      });
      if (newLink) {
        console.log(`Linked Keyword "${keyword.keyword}" to Restaurant "${restaurant.name}"`);
      }
    } else {
      console.warn(`Could not create link: Keyword "${link.keyword}" or Restaurant "${link.restaurantName}" not found.`);
    }
  }

  console.log('Seeding complete.');
}

seedKeywordsAndKeywordRestaurants().catch(console.error);
