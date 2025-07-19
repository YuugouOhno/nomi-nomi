"use client";

import { useState } from "react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="例: 銀座で寿司、個室あり"
        className="flex-grow px-4 py-3 text-base md:text-lg text-gray-700 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 shadow-sm"
        disabled={isLoading}
      />
      <button 
        type="submit"
        className="px-6 md:px-8 py-3 text-base md:text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        disabled={isLoading}
      >
        {isLoading ? "検索中..." : "検索"}
      </button>
    </form>
  );
}