"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PredictionCardProps {
  prediction: {
    finalScore: number;
    label: string;
    technicalScore: number;
    sentimentScore: number;
    experienceScore: number;
  };
}

export function PredictionCard({ prediction }: PredictionCardProps) {
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

  const getIcon = () => {
    switch (prediction.label) {
      case "Bullish":
        return <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />;
      case "Bearish":
        return <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Final Prediction</span>
          {getIcon()}
        </CardTitle>
        <CardDescription>Based on comprehensive analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {(prediction.finalScore * 100).toFixed(1)}%
            </div>
            <Badge variant={getBadgeVariant(prediction.label)} className="text-lg px-4 py-1">
              {prediction.label}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Score Breakdown</div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Technical Analysis (40%)</span>
                <span className="font-medium">{prediction.technicalScore.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${prediction.technicalScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">News Sentiment (40%)</span>
                <span className="font-medium">{(prediction.sentimentScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${prediction.sentimentScore * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">User Experience (20%)</span>
                <span className="font-medium">{(prediction.experienceScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${prediction.experienceScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
