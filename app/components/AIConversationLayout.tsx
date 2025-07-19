"use client";

import { useState, useMemo } from "react";
import { View, useTheme, Button, TextAreaField, Card, Text, SelectField, Divider } from "@aws-amplify/ui-react";
import Markdown from "react-markdown";
import { 
  MultiLLMService, 
  MultiLLMConversationManager, 
  MultiLLMMessage 
} from "@/app/lib/multi-llm-service";

type LLMType = "master" | "restaurant" | "trip" | "food";

export const AIConversationLayout = ({ id }: { id?: string }) => {
  const { tokens } = useTheme();
  const conversationManager = useMemo(() => new MultiLLMConversationManager(), []);
  const [messages, setMessages] = useState<MultiLLMMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<LLMType>("master");

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userInput = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      let response;

      if (selectedLLM === "master") {
        // マスターオーケストレーターとの会話（会話履歴を自動管理）
        const assistantMessage = await conversationManager.sendMessageToMaster(userInput);
        setMessages(conversationManager.getMessages());
      } else {
        // 専門LLMとの直接会話
        conversationManager.addMessage("user", userInput);

        switch (selectedLLM) {
          case "restaurant":
            response = await MultiLLMService.queryRestaurantSpecialist(userInput);
            break;
          case "trip":
            response = await MultiLLMService.queryTripPlanner(userInput);
            break;
          case "food":
            response = await MultiLLMService.queryFoodCritic(userInput);
            break;
          default:
            throw new Error("不正なLLMタイプです");
        }

        // 応答を追加
        conversationManager.addMessage(
          "assistant",
          response.success ? response.data! : response.error!,
          selectedLLM,
          !response.success
        );
        
        setMessages(conversationManager.getMessages());
      }
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
  };

  const getLLMDisplayName = (llmType: LLMType, isUser = false): string => {
    if (isUser) return "あなた";
    
    switch (llmType) {
      case "master": return "🎯 マスターAI";
      case "restaurant": return "🍽️ レストランAI";
      case "trip": return "✈️ 旅行AI";
      case "food": return "👨‍🍳 グルメAI";
      default: return "AI";
    }
  };

  const getPlaceholderText = (llmType: LLMType): string => {
    switch (llmType) {
      case "master": return "何でもお気軽にご質問ください。適切な専門AIが対応します...";
      case "restaurant": return "レストランについて教えてください（場所、料理の種類、予算など）...";
      case "trip": return "旅行の目的地や期間、興味のあることを教えてください...";
      case "food": return "料理やレストランについてのレビューや評価をお聞かせください...";
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
          <option value="master">🎯 マスターAI（推奨）</option>
          <option value="restaurant">🍽️ レストラン専門AI</option>
          <option value="trip">✈️ 旅行計画専門AI</option>
          <option value="food">👨‍🍳 グルメ評価専門AI</option>
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
          {selectedLLM === "master" && "🎯 マスターAI: あらゆる質問に対して、適切な専門AIを自動選択して回答します"}
          {selectedLLM === "restaurant" && "🍽️ レストラン専門AI: お店探し、メニュー情報、予約方法など"}
          {selectedLLM === "trip" && "✈️ 旅行計画専門AI: 観光プラン、ルート提案、宿泊情報など"}
          {selectedLLM === "food" && "👨‍🍳 グルメ評価専門AI: 料理レビュー、味の分析、グルメ評価など"}
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