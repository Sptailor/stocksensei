"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{quote.symbol}</div>
            <div className="text-sm text-muted-foreground font-normal">{quote.name}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatCurrency(quote.price)}</div>
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {formatCurrency(Math.abs(quote.change))} ({formatPercentage(quote.changePercent)})
            </div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
