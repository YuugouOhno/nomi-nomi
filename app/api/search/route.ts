import { NextRequest, NextResponse } from 'next/server'
import { SearchResponse, SearchResult, Izakaya } from '@/app/types'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'クエリが必要です' },
        { status: 400 }
      )
    }

    // TODO: 実際のLLMを使用したクエリ処理を実装
    const extractedKeywords = await extractKeywordsFromQuery(query)
    const extractedConditions = await extractConditionsFromQuery(query)
    
    // TODO: 実際のデータベース検索を実装
    const mockResults = await searchIzakayas(extractedKeywords, extractedConditions)
    
    const response: SearchResponse = {
      results: mockResults,
      totalCount: mockResults.length,
      query: {
        id: `query_${Date.now()}`,
        query,
        extractedKeywords,
        extractedConditions,
        createdAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function extractKeywordsFromQuery(query: string): Promise<string[]> {
  // TODO: 実際のLLMを使用してキーワードを抽出
  // 現在はシンプルなキーワード抽出のモック実装
  const keywords: string[] = []
  
  if (query.includes('個室')) keywords.push('個室')
  if (query.includes('安い') || query.includes('リーズナブル')) keywords.push('安い')
  if (query.includes('美味しい') || query.includes('おいしい')) keywords.push('美味しい')
  if (query.includes('焼き鳥')) keywords.push('焼き鳥')
  if (query.includes('刺身') || query.includes('魚')) keywords.push('刺身')
  if (query.includes('新宿')) keywords.push('新宿')
  if (query.includes('渋谷')) keywords.push('渋谷')
  if (query.includes('駅近')) keywords.push('駅近')
  
  return keywords
}

async function extractConditionsFromQuery(query: string): Promise<{
  priceRange?: 'LOW' | 'MEDIUM' | 'HIGH'
  hasPrivateRoom?: boolean
  minRating?: number
}> {
  // TODO: 実際のLLMを使用して条件を抽出
  const conditions: any = {}
  
  if (query.includes('個室')) {
    conditions.hasPrivateRoom = true
  }
  
  if (query.includes('安い') || query.includes('リーズナブル')) {
    conditions.priceRange = 'LOW'
  } else if (query.includes('高級') || query.includes('高い')) {
    conditions.priceRange = 'HIGH'
  } else {
    conditions.priceRange = 'MEDIUM'
  }
  
  if (query.includes('評価の高い') || query.includes('人気')) {
    conditions.minRating = 4.0
  }
  
  return conditions
}

async function searchIzakayas(keywords: string[], conditions: any): Promise<SearchResult[]> {
  // TODO: 実際のデータベース検索を実装
  // 現在はモックデータを返す
  const mockIzakayas: Izakaya[] = [
    {
      id: '1',
      name: '新宿個室居酒屋 鳥心',
      address: '東京都新宿区西新宿1-1-1',
      phone: '03-1234-5678',
      priceRange: 'MEDIUM',
      hasPrivateRoom: true,
      rating: 4.2,
      totalReviews: 156,
      googlePlaceId: 'place_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '美味しい焼き鳥 とりどり',
      address: '東京都新宿区新宿3-15-17',
      phone: '03-2345-6789',
      priceRange: 'LOW',
      hasPrivateRoom: false,
      rating: 4.5,
      totalReviews: 203,
      googlePlaceId: 'place_2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: '新宿海鮮酒場 魚々',
      address: '東京都新宿区新宿2-8-3',
      phone: '03-3456-7890',
      priceRange: 'MEDIUM',
      hasPrivateRoom: true,
      rating: 4.0,
      totalReviews: 89,
      googlePlaceId: 'place_3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  // フィルタリング
  let filteredIzakayas = mockIzakayas
  
  if (conditions.hasPrivateRoom) {
    filteredIzakayas = filteredIzakayas.filter(izakaya => izakaya.hasPrivateRoom)
  }
  
  if (conditions.priceRange) {
    filteredIzakayas = filteredIzakayas.filter(izakaya => izakaya.priceRange === conditions.priceRange)
  }
  
  if (conditions.minRating) {
    filteredIzakayas = filteredIzakayas.filter(izakaya => izakaya.rating >= conditions.minRating)
  }
  
  // 結果の構築
  const results: SearchResult[] = filteredIzakayas.map(izakaya => {
    const matchedKeywords = keywords.filter(keyword => {
      if (keyword === '個室' && izakaya.hasPrivateRoom) return true
      if (keyword === '安い' && izakaya.priceRange === 'LOW') return true
      if (keyword === '焼き鳥' && izakaya.name.includes('焼き鳥')) return true
      if (keyword === '刺身' && izakaya.name.includes('魚')) return true
      if (keyword === '新宿' && izakaya.address.includes('新宿')) return true
      return false
    })
    
    const relevanceScore = calculateRelevanceScore(izakaya, keywords, conditions)
    const explanation = generateExplanation(izakaya, matchedKeywords, conditions)
    
    return {
      izakaya,
      relevanceScore,
      matchedKeywords,
      explanation
    }
  })
  
  // 関連度でソート
  results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  
  return results
}

function calculateRelevanceScore(izakaya: Izakaya, keywords: string[], conditions: any): number {
  let score = 0
  
  // 基本スコア
  score += izakaya.rating * 10
  
  // キーワードマッチング
  keywords.forEach(keyword => {
    if (keyword === '個室' && izakaya.hasPrivateRoom) score += 20
    if (keyword === '安い' && izakaya.priceRange === 'LOW') score += 15
    if (keyword === '焼き鳥' && izakaya.name.includes('焼き鳥')) score += 25
    if (keyword === '刺身' && izakaya.name.includes('魚')) score += 25
    if (keyword === '新宿' && izakaya.address.includes('新宿')) score += 10
  })
  
  // 条件マッチング
  if (conditions.hasPrivateRoom && izakaya.hasPrivateRoom) score += 15
  if (conditions.priceRange && izakaya.priceRange === conditions.priceRange) score += 10
  if (conditions.minRating && izakaya.rating >= conditions.minRating) score += 10
  
  return score
}

function generateExplanation(izakaya: Izakaya, matchedKeywords: string[], conditions: any): string {
  const explanations: string[] = []
  
  if (matchedKeywords.includes('個室')) {
    explanations.push('個室が利用可能です')
  }
  
  if (matchedKeywords.includes('安い')) {
    explanations.push('リーズナブルな価格帯です')
  }
  
  if (matchedKeywords.includes('焼き鳥')) {
    explanations.push('焼き鳥がメニューの中心です')
  }
  
  if (matchedKeywords.includes('刺身')) {
    explanations.push('新鮮な魚介類が楽しめます')
  }
  
  if (matchedKeywords.includes('新宿')) {
    explanations.push('新宿エリアにあります')
  }
  
  if (izakaya.rating >= 4.0) {
    explanations.push(`高評価（${izakaya.rating}★）の人気店です`)
  }
  
  return explanations.join('。') + '。'
}