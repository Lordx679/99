import { useState } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        placeholder="البحث في المشاريع..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-discord-dark text-white placeholder-discord-text rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-discord-blurple border-discord-dark"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-discord-text hover:text-white transition-colors"
      >
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
}
