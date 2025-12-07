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
}

export function PredictionHistory({ predictions }: PredictionHistoryProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No predictions yet. Analyze a stock to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold">{prediction.stockSymbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(prediction.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">
                      {(prediction.finalScore * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(prediction.label)}>
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
