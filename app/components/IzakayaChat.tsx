'use client'

import { generateClient } from 'aws-amplify/data'
import { createAIHooks, AIConversation } from '@aws-amplify/ui-react-ai'
import { Authenticator } from '@aws-amplify/ui-react'
import Link from 'next/link'
import { Icon } from '@/app/components/ui/Icon'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>({ authMode: 'userPool' })
const { useAIConversation } = createAIHooks(client)

function Chat() {
  const [
    {
      data: { messages },
      isLoading,
    },
    sendMessage,
  ] = useAIConversation('izakayaChat')

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <AIConversation
          messages={messages}
          isLoading={isLoading}
          handleSendMessage={sendMessage}
          allowAttachments={false}
          avatars={{
            ai: {
              username: '居酒屋アシスタント',
              avatar: '🍻'
            },
            user: {
              username: 'あなた',
              avatar: '🍺'
            }
          }}
        />
      </div>
    </div>
  )
}

export default function IzakayaChat() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="h-screen flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="ChatBubbleLeftRightIcon" size="md" className="text-blue-600" />
                <span className="text-lg font-semibold">居酒屋レビュー検索チャット</span>
                <span className="text-sm text-gray-500">- {user?.username}さん</span>
              </div>
              <Link
                href="/search"
                className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50"
              >
                従来の検索
              </Link>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            >
              ログアウト
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chat />
          </div>
        </div>
      )}
    </Authenticator>
  )
}