"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StockQuoteCardProps {
  quote: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  };
}

export function StockQuoteCard({ quote }: StockQuoteCardProps) {
  const isPositive = quote.change >= 0;

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20 overflow-hidden relative">
      {/* Gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>

      <CardHeader className="pb-8">
        <CardTitle className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-blue-100">{quote.symbol}</div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isPositive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                LIVE
              </div>
            </div>
            <div className="text-sm text-blue-300/70 font-normal">{quote.name}</div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-4xl font-bold text-blue-50">{formatCurrency(quote.price)}</div>
            <div
              className={`flex items-center justify-end gap-2 text-base font-semibold px-3 py-1.5 rounded-lg ${
                isPositive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-5 w-5" />
              ) : (
                <ArrowDown className="h-5 w-5" />
              )}
              <span>{formatCurrency(Math.abs(quote.change))}</span>
              <span className="text-sm">({formatPercentage(quote.changePercent)})</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
