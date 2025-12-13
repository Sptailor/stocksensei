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
    details?: {
      volumeAnalysis?: {
        compressionStatus: string;
        breakoutStatus: string;
        insights: string[];
      };
    };
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
                <span className="text-blue-300/80 font-mono">Technical Analysis (50%)</span>
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
                <span className="text-purple-300/80 font-mono">AI News Sentiment (50%)</span>
                <span className="font-bold text-purple-100">{(prediction.sentimentScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all shadow-lg shadow-purple-500/50"
                  style={{ width: `${prediction.sentimentScore * 100}%` }}
                />
              </div>
            </div>

          </div>

          {/* Volume Analysis Insights */}
          {prediction.details?.volumeAnalysis && prediction.details.volumeAnalysis.insights.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-yellow-200">Volume Pattern Analysis</div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {prediction.details.volumeAnalysis.compressionStatus === 'active' && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border text-xs">
                      ⚠️ In Compression
                    </Badge>
                  )}
                  {prediction.details.volumeAnalysis.breakoutStatus !== 'none' && (
                    <Badge className={`${
                      prediction.details.volumeAnalysis.breakoutStatus === 'bullish'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    } border text-xs`}>
                      {prediction.details.volumeAnalysis.breakoutStatus === 'bullish' ? '🚀' : '📉'} {prediction.details.volumeAnalysis.breakoutStatus} Breakout
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {prediction.details.volumeAnalysis.insights.map((insight, idx) => (
                  <div key={idx} className="text-sm text-yellow-100/90 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
