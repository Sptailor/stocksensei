"use client";

import { useState, useRef, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

const CATEGORIZED_STOCKS = {
  "US Tech": [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "AMD", name: "Advanced Micro Devices" },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "ORCL", name: "Oracle Corporation" },
  ],
  "US Finance": [
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "BAC", name: "Bank of America" },
    { symbol: "WFC", name: "Wells Fargo" },
    { symbol: "GS", name: "Goldman Sachs" },
    { symbol: "MS", name: "Morgan Stanley" },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard" },
    { symbol: "AXP", name: "American Express" },
  ],
  "US Consumer & Retail": [
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "HD", name: "Home Depot" },
    { symbol: "NKE", name: "Nike Inc." },
    { symbol: "MCD", name: "McDonald's" },
    { symbol: "SBUX", name: "Starbucks" },
    { symbol: "DIS", name: "The Walt Disney Company" },
  ],
  "US Healthcare & Pharma": [
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "UNH", name: "UnitedHealth Group" },
    { symbol: "PFE", name: "Pfizer Inc." },
    { symbol: "ABBV", name: "AbbVie Inc." },
    { symbol: "TMO", name: "Thermo Fisher Scientific" },
  ],
  "US Energy & Industrial": [
    { symbol: "XOM", name: "Exxon Mobil Corporation" },
    { symbol: "CVX", name: "Chevron Corporation" },
    { symbol: "BA", name: "Boeing Company" },
    { symbol: "GE", name: "General Electric" },
    { symbol: "CAT", name: "Caterpillar Inc." },
  ],
  "Europe": [
    { symbol: "ASML", name: "ASML Holding (Netherlands)" },
    { symbol: "SAP", name: "SAP SE (Germany)" },
    { symbol: "MC.PA", name: "LVMH (France)" },
    { symbol: "NVO", name: "Novo Nordisk (Denmark)" },
    { symbol: "NESN.SW", name: "Nestlé (Switzerland)" },
    { symbol: "RMS.PA", name: "Hermès (France)" },
    { symbol: "BP.L", name: "BP (UK)" },
    { symbol: "SHEL.L", name: "Shell (UK)" },
    { symbol: "VOW3.DE", name: "Volkswagen (Germany)" },
  ],
  "Asia & Pacific": [
    { symbol: "TSM", name: "Taiwan Semiconductor" },
    { symbol: "BABA", name: "Alibaba Group (China)" },
    { symbol: "9988.HK", name: "Alibaba (Hong Kong)" },
    { symbol: "0700.HK", name: "Tencent (Hong Kong)" },
    { symbol: "7203.T", name: "Toyota (Japan)" },
    { symbol: "005930.KS", name: "Samsung (South Korea)" },
    { symbol: "BHP.AX", name: "BHP Group (Australia)" },
    { symbol: "RELIANCE.NS", name: "Reliance Industries (India)" },
  ],
  "Canada": [
    { symbol: "SHOP.TO", name: "Shopify" },
    { symbol: "RY.TO", name: "Royal Bank of Canada" },
    { symbol: "TD.TO", name: "TD Bank" },
    { symbol: "ENB.TO", name: "Enbridge" },
    { symbol: "CNQ.TO", name: "Canadian Natural Resources" },
  ],
};

const POPULAR_STOCKS = Object.values(CATEGORIZED_STOCKS).flat();

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState(POPULAR_STOCKS);
  const searchRef = useRef<HTMLFormElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
        setShowBrowse(false);
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

  const handleBrowseSelect = (symbol: string) => {
    onSelectStock(symbol);
    setShowBrowse(false);
  };

  return (
    <div className="flex gap-3">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-1" ref={searchRef}>
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

    {/* Browse Stocks Button */}
    <div className="relative" ref={browseRef}>
      <Button
        type="button"
        onClick={() => setShowBrowse(!showBrowse)}
        className="h-12 px-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Browse
      </Button>

      {/* Categorized Stocks Dropdown */}
      {showBrowse && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 max-h-[600px] overflow-y-auto z-50">
          <div className="p-4">
            <div className="mb-3 pb-3 border-b border-purple-500/20">
              <h3 className="text-sm font-semibold text-purple-300">Browse Stocks by Category</h3>
            </div>
            {Object.entries(CATEGORIZED_STOCKS).map(([category, stocks]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 px-2 py-2 text-xs text-purple-300/70 font-semibold uppercase tracking-wide">
                  <TrendingUp className="h-3 w-3" />
                  <span>{category}</span>
                </div>
                <div className="space-y-1">
                  {stocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => handleBrowseSelect(stock.symbol)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-500/10 transition-all group border border-transparent hover:border-purple-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-purple-100 group-hover:text-purple-50 transition-colors text-sm">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-purple-300/60 group-hover:text-purple-300/80 transition-colors">
                            {stock.name}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
