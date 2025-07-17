'use client'

import { useState } from 'react'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { Icon } from '@/app/components/ui/Icon'

interface SearchBoxProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function SearchBox({ onSearch, isLoading = false, placeholder = "居酒屋を探す（例：新宿の個室がある居酒屋）" }: SearchBoxProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="pr-12"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {isLoading ? (
            <Icon name="ArrowPathIcon" size="sm" className="animate-spin" />
          ) : (
            <Icon name="MagnifyingGlassIcon" size="sm" />
          )}
        </Button>
      </div>
    </form>
  )
}