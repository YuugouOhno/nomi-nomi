import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';


/**
 * バックエンドリソースの定義
 * 以下のコンポーネントを含みます：
 * - auth: 認証関連のリソース
 * - data: データストレージ関連のリソース（レストラン + マルチLLMアーキテクチャ）
 * 
 * マルチLLMアーキテクチャ：
 * - masterOrchestrator: メインAI（LLM_A）
 * - restaurantSpecialist: レストラン専門AI（LLM_B）
 * - tripPlanner: 旅行計画専門AI（LLM_C）
 * - foodCritic: フードクリティック専門AI（LLM_D）
 */
const backend = defineBackend({
  auth,
  data,
});
