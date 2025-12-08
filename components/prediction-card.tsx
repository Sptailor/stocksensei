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
    <Card className="glass-card border-2 border-blue-500/30 relative overflow-hidden gradient-border">
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between text-blue-100">
          <span className="text-2xl">Final Prediction</span>
          {getIcon()}
        </CardTitle>
        <CardDescription className="text-blue-300/60">AI-powered market analysis</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-6">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {(prediction.finalScore * 100).toFixed(1)}%
            </div>
            <Badge
              variant={getBadgeVariant(prediction.label)}
              className={`text-lg px-6 py-2 border ${
                prediction.label === 'Bullish'
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : prediction.label === 'Bearish'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
              }`}
            >
              {prediction.label}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-blue-200 mb-3">Score Breakdown</div>

            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-300/80 font-mono">Technical Analysis (40%)</span>
                <span className="font-bold text-blue-100">{prediction.technicalScore.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all shadow-lg shadow-blue-500/50"
                  style={{ width: `${prediction.technicalScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-300/80 font-mono">News Sentiment (40%)</span>
                <span className="font-bold text-purple-100">{(prediction.sentimentScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all shadow-lg shadow-purple-500/50"
                  style={{ width: `${prediction.sentimentScore * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-300/80 font-mono">User Experience (20%)</span>
                <span className="font-bold text-orange-100">{(prediction.experienceScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2.5 rounded-full transition-all shadow-lg shadow-orange-500/50"
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
