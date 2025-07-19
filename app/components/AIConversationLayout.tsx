"use client";

import { useState, useMemo } from "react";
import { View, useTheme, Button, TextAreaField, Card, Text, SelectField, Divider } from "@aws-amplify/ui-react";
import Markdown from "react-markdown";
import { 
  MultiLLMService, 
  MultiLLMConversationManager, 
  MultiLLMMessage,
  searchRestaurantsIntegrated,
  LLMAResponse,
  LLMBResponse
} from "@/app/lib/multi-llm-service";

type LLMType = "integrated" | "llmA" | "llmB" | "llmC" | "restaurant_search";

interface RestaurantSearchResult {
  restaurants: any[];
  llmCResponse?: string;
}

export const AIConversationLayout = ({ id }: { id?: string }) => {
  const { tokens } = useTheme();
  const conversationManager = useMemo(() => new MultiLLMConversationManager(), []);
  const [messages, setMessages] = useState<MultiLLMMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<LLMType>("restaurant_search");
  const [searchResults, setSearchResults] = useState<RestaurantSearchResult | null>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userInput = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      let response;

      // ユーザーメッセージを追加
      conversationManager.addMessage("user", userInput);

      // 選択されたAIに送信
      switch (selectedLLM) {
        case "restaurant_search":
          // レストラン検索モード
          setSearchResults(null); // 前の結果をクリア
          
          // LLM_AとLLM_Bを並行実行
          const [llmAResponse, llmBResponse] = await Promise.all([
            MultiLLMService.queryLLMA(userInput),
            MultiLLMService.queryLLMB(userInput)
          ]);

          if (llmAResponse.success && llmBResponse.success) {
            // 統合検索を実行
            const searchResult = await searchRestaurantsIntegrated(
              llmAResponse.data as LLMAResponse,
              llmBResponse.data as LLMBResponse,
              userInput
            );

            setSearchResults(searchResult);

            // 推薦文をメッセージに追加
            const recommendationText = searchResult.llmCResponse || 
              `${searchResult.restaurants.length}件のレストランが見つかりました。`;
            
            conversationManager.addMessage(
              "assistant",
              recommendationText,
              selectedLLM,
              false
            );
          } else {
            throw new Error("レストラン検索に失敗しました");
          }
          break;

        case "integrated":
          response = await MultiLLMService.queryIntegratedAI(userInput);
          conversationManager.addMessage(
            "assistant",
            response.success ? response.data! : response.error!,
            selectedLLM,
            !response.success
          );
          break;
        case "llmA":
          response = await MultiLLMService.queryLLMA(userInput);
          conversationManager.addMessage(
            "assistant",
            response.success ? JSON.stringify(response.data, null, 2) : response.error!,
            selectedLLM,
            !response.success
          );
          break;
        case "llmB":
          response = await MultiLLMService.queryLLMB(userInput);
          conversationManager.addMessage(
            "assistant",
            response.success ? (response.data as string[]).join(', ') : response.error!,
            selectedLLM,
            !response.success
          );
          break;
        case "llmC":
          response = await MultiLLMService.queryLLMC(userInput);
          conversationManager.addMessage(
            "assistant",
            response.success ? response.data! : response.error!,
            selectedLLM,
            !response.success
          );
          break;
        default:
          throw new Error("不正なLLMタイプです");
      }
      
      setMessages(conversationManager.getMessages());
    } catch (error) {
      console.error("Error calling Multi-LLM:", error);
      conversationManager.addMessage(
        "assistant", 
        "予期しないエラーが発生しました。もう一度お試しください。",
        selectedLLM,
        true
      );
      setMessages(conversationManager.getMessages());
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearConversation = () => {
    conversationManager.clear();
    setMessages([]);
    setSearchResults(null);
  };

  const getLLMDisplayName = (llmType: LLMType, isUser = false): string => {
    if (isUser) return "あなた";
    
    switch (llmType) {
      case "restaurant_search": return "🍽️ レストラン検索AI";
      case "integrated": return "🤝 統合AI";
      case "llmA": return "🅰️ LLM_A";
      case "llmB": return "🅱️ LLM_B";
      case "llmC": return "©️ LLM_C";
      default: return "AI";
    }
  };

  const getPlaceholderText = (llmType: LLMType): string => {
    switch (llmType) {
      case "restaurant_search": return "レストランを探してください（例：渋谷で美味しいイタリアンを探している）...";
      case "integrated": return "何でも質問してください。全てのLLMが連携して回答します...";
      case "llmA": return "LLM_Aに質問してください...";
      case "llmB": return "LLM_Bに質問してください...";
      case "llmC": return "LLM_Cに質問してください...";
      default: return "メッセージを入力してください...";
    }
  };

  return (
    <View padding={tokens.space.large}>
      {/* LLM選択とクリアボタン */}
      <View marginBottom={tokens.space.medium}>
        <SelectField
          label="AI選択"
          value={selectedLLM}
          onChange={(e) => setSelectedLLM(e.target.value as LLMType)}
          disabled={isLoading}
        >
          <option value="restaurant_search">🍽️ レストラン検索AI（推奨）</option>
          <option value="integrated">🤝 統合AI</option>
          <option value="llmA">🅰️ LLM_A</option>
          <option value="llmB">🅱️ LLM_B</option>
          <option value="llmC">©️ LLM_C</option>
        </SelectField>
        <Button 
          onClick={handleClearConversation}
          variation="link"
          size="small"
        >
          会話をクリア
        </Button>
      </View>

      {/* AI機能の説明 */}
      <Card marginBottom={tokens.space.medium} backgroundColor={tokens.colors.neutral[10]}>
        <Text fontSize={tokens.fontSizes.small} color={tokens.colors.neutral[80]}>
          {selectedLLM === "restaurant_search" && "🍽️ レストラン検索AI: 自然言語でレストランを検索し、推薦文とリストを表示"}
          {selectedLLM === "integrated" && "🤝 統合AI: 全てのLLM（A・B・C）を順次実行し、統合的な回答を提供"}
          {selectedLLM === "llmA" && "🅰️ LLM_A: レストラン検索条件を構造化データで抽出"}
          {selectedLLM === "llmB" && "🅱️ LLM_B: 検索キーワードを配列で抽出"}
          {selectedLLM === "llmC" && "©️ LLM_C: レストラン推薦文を生成"}
        </Text>
      </Card>

      {/* メッセージ表示エリア */}
      <View height="500px" overflow="auto" marginBottom={tokens.space.medium}>
        {messages.map((message) => (
          <Card 
            key={message.id} 
            margin={tokens.space.small}
            backgroundColor={message.error ? tokens.colors.red[10] : undefined}
          >
            <View marginBottom={tokens.space.xs}>
              <Text
                fontWeight="bold"
                color={
                  message.role === "user" 
                    ? tokens.colors.blue[80] 
                    : message.error 
                      ? tokens.colors.red[80]
                      : tokens.colors.green[80]
                }
              >
                {getLLMDisplayName(message.source || selectedLLM, message.role === "user")}
              </Text>
              <Text fontSize={tokens.fontSizes.xs} color={tokens.colors.neutral[60]}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
            <View>
              {message.role === "assistant" && !message.error ? (
                <Markdown>{message.content}</Markdown>
              ) : (
                <Text color={message.error ? tokens.colors.red[90] : undefined}>
                  {message.content}
                </Text>
              )}
            </View>
          </Card>
        ))}
        {isLoading && (
          <Card margin={tokens.space.small} backgroundColor={tokens.colors.neutral[10]}>
            <Text color={tokens.colors.neutral[80]}>
              {getLLMDisplayName(selectedLLM)} が回答を生成中...
            </Text>
          </Card>
        )}
      </View>

      {/* レストラン検索結果の表示 */}
      {searchResults && searchResults.restaurants.length > 0 && (
        <View marginBottom={tokens.space.medium}>
          <Text fontSize={tokens.fontSizes.large} fontWeight="bold" marginBottom={tokens.space.medium}>
            🍽️ 検索結果（{searchResults.restaurants.length}件）
          </Text>
          <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.restaurants.map((restaurant, index) => (
              <Card 
                key={restaurant.id || index} 
                className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl bg-white"
                padding={tokens.space.medium}
              >
                {/* レストラン画像 */}
                {/* {restaurant.images && restaurant.images[0] && (
                  <View marginBottom={tokens.space.small}>
                    <img 
                      src={restaurant.images[0]} 
                      alt={restaurant.name}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover',
                        borderRadius: tokens.radii.medium
                      }}
                    />
                  </View>
                )} */}
                
                {/* レストラン名 */}
                <Text fontSize={tokens.fontSizes.large} fontWeight="bold" marginBottom={tokens.space.small}>
                  {restaurant.name}
                </Text>
                
                {/* タグ */}
                <View className="flex flex-wrap gap-2 mb-3">
                  {restaurant.area && (
                    <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {restaurant.area}
                    </span>
                  )}
                  {restaurant.cuisine?.[0] && (
                    <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {restaurant.cuisine[0]}
                    </span>
                  )}
                  {restaurant.priceCategory && (
                    <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {restaurant.priceCategory}
                    </span>
                  )}
                </View>
                
                {/* 説明 */}
                <Text 
                  fontSize={tokens.fontSizes.small} 
                  color={tokens.colors.neutral[60]} 
                  marginBottom={tokens.space.medium}
                >
                  {restaurant.description 
                    ? `${restaurant.description.substring(0, 80)}...` 
                    : 'お店の説明がありません。'
                  }
                </Text>
                
                {/* 評価と価格 */}
                <View className="flex justify-between items-center text-sm border-t pt-3">
                  <Text fontSize={tokens.fontSizes.small} fontWeight="bold">
                    {restaurant.ratingAverage ? `⭐ ${restaurant.ratingAverage}` : '評価なし'}
                  </Text>
                  {restaurant.priceMin && restaurant.priceMax && (
                    <Text fontSize={tokens.fontSizes.small} color={tokens.colors.neutral[60]}>
                      ¥{restaurant.priceMin} - ¥{restaurant.priceMax}
                    </Text>
                  )}
                </View>
                
                {/* 住所 */}
                {restaurant.address && (
                  <Text 
                    fontSize={tokens.fontSizes.xs} 
                    color={tokens.colors.neutral[50]} 
                    marginTop={tokens.space.xs}
                  >
                    📍 {restaurant.address}
                  </Text>
                )}
              </Card>
            ))}
          </View>
        </View>
      )}

      <Divider marginBottom={tokens.space.medium} />

      {/* 入力エリア */}
      <View>
        <TextAreaField
          label=""
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={getPlaceholderText(selectedLLM)}
          rows={3}
          flex="1"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          variation="primary"
          isLoading={isLoading}
          size="large"
        >
          送信
        </Button>
      </View>
    </View>
  );
};