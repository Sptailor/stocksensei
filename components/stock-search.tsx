"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      onSelectStock(search.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
        <Input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL, TSLA)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-slate-900/50 border-blue-500/30 text-blue-100 placeholder:text-blue-300/50 focus:border-blue-500/60 focus:ring-blue-500/30 backdrop-blur-xl"
        />
      </div>
      <Button
        type="submit"
        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
      >
        Search
      </Button>
    </form>
  );
}
