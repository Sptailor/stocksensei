"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PredictionHistoryProps {
  predictions: Array<{
    id: number;
    stockSymbol: string;
    finalScore: number;
    label: string;
    createdAt: Date;
  }>;
  onSelectStock: (symbol: string) => void;
}

export function PredictionHistory({ predictions, onSelectStock }: PredictionHistoryProps) {
  const getBadgeVariant = (label: string) => {
    switch (label) {
      case "Bullish":
        return "bullish" as const;
      case "Bearish":
        return "bearish" as const;
      default:
        return "neutral" as const;
    }
  };

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-100 flex items-center gap-2">
          <span>Recent Predictions</span>
          <span className="text-xs font-normal text-blue-300/60 bg-blue-500/20 px-2 py-1 rounded-full">
            {predictions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-blue-300/60">
              No predictions yet. Analyze a stock to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                onClick={() => onSelectStock(prediction.stockSymbol)}
                className="flex items-center justify-between p-3 rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent hover:from-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="font-bold text-blue-100 group-hover:text-blue-50 transition-colors">
                    {prediction.stockSymbol}
                  </div>
                  <div className="text-xs text-blue-300/50 font-mono">
                    {format(new Date(prediction.createdAt), "MMM dd, HH:mm")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-blue-100">
                      {(prediction.finalScore * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Badge
                    variant={getBadgeVariant(prediction.label)}
                    className={`border ${
                      prediction.label === 'Bullish'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : prediction.label === 'Bearish'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}
                  >
                    {prediction.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
