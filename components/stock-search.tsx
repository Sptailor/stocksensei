"use client";

import { useState, useRef, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "BA", name: "Boeing Company" },
  { symbol: "GE", name: "General Electric" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "PG", name: "Procter & Gamble" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "BAC", name: "Bank of America" },
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
];

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState(POPULAR_STOCKS);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = POPULAR_STOCKS.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
          stock.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStocks(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredStocks(POPULAR_STOCKS);
      setShowSuggestions(false);
    }
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      onSelectStock(search.trim().toUpperCase());
      setShowSuggestions(false);
      setSearch("");
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    onSelectStock(symbol);
    setSearch("");
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3" ref={searchRef}>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400 z-10" />
        <Input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL, TSLA)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search.trim() && setShowSuggestions(true)}
          className="pl-12 h-12 bg-slate-900/50 border-blue-500/30 text-blue-100 placeholder:text-blue-300/50 focus:border-blue-500/60 focus:ring-blue-500/30 backdrop-blur-xl"
          autoComplete="off"
        />

        {/* Autocomplete Dropdown */}
        {showSuggestions && filteredStocks.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-2xl shadow-blue-500/20 max-h-96 overflow-y-auto z-50">
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-blue-300/60 font-mono">
                <TrendingUp className="h-3 w-3" />
                <span>Popular Stocks</span>
              </div>
              {filteredStocks.slice(0, 10).map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleSelectSuggestion(stock.symbol)}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-blue-500/10 transition-all group border border-transparent hover:border-blue-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-blue-100 group-hover:text-blue-50 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-xs text-blue-300/60 group-hover:text-blue-300/80 transition-colors">
                        {stock.name}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
              {filteredStocks.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-blue-300/60">
                  No matching stocks found
                </div>
              )}
            </div>
          </div>
        )}
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
