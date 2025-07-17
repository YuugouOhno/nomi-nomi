'use client';

import { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBox({ onSearch, loading = false }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：渋谷にある海鮮が美味しい居酒屋教えて"
            className="text-lg py-3 px-4 h-12"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={!query.trim() || loading}
          className="h-12 px-8"
        >
          検索
        </Button>
      </form>
    </div>
  );
}