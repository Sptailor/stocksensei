"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle } from "lucide-react";

interface SentimentCardProps {
  sentimentScore: number;
  sentimentLabel?: string;
  explanation: string;
  headlines?: string[];
  positiveIndicators?: string[];
  negativeIndicators?: string[];
  confidence?: number;
  articlesAnalyzed?: number;
}

export function SentimentCard({
  sentimentScore,
  sentimentLabel,
  explanation,
  headlines,
  positiveIndicators,
  negativeIndicators,
  confidence,
  articlesAnalyzed,
}: SentimentCardProps) {
  const getSentimentBadge = (score: number, label?: string) => {
    if (label) {
      if (label === "Insufficient Data") return { variant: "secondary" as const, icon: Minus };
      if (label.includes("Positive")) return { variant: "bullish" as const, icon: TrendingUp };
      if (label.includes("Negative")) return { variant: "bearish" as const, icon: TrendingDown };
    }
    if (score >= 0.3) return { variant: "bullish" as const, icon: TrendingUp };
    if (score <= -0.3) return { variant: "bearish" as const, icon: TrendingDown };
    return { variant: "neutral" as const, icon: Minus };
  };

  const sentiment = getSentimentBadge(sentimentScore, sentimentLabel);
  const SentimentIcon = sentiment.icon;
  const displayLabel = sentimentLabel || (sentimentScore >= 0.3 ? "Positive" : sentimentScore <= -0.3 ? "Negative" : "Neutral");
  const isInsufficientData = sentimentLabel === "Insufficient Data";

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-100">News Sentiment Analysis</CardTitle>
          <SentimentIcon className={`h-6 w-6 ${sentimentScore >= 0.3 ? 'text-green-400' : sentimentScore <= -0.3 ? 'text-red-400' : 'text-yellow-400'}`} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {!isInsufficientData && (
            <span className="text-sm text-blue-300/80 font-mono">
              Score: {sentimentScore.toFixed(2)}
            </span>
          )}
          <Badge
            variant={sentiment.variant}
            className={`border ${
              sentimentScore >= 0.3
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : sentimentScore <= -0.3
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}
          >
            {displayLabel}
          </Badge>
          {!isInsufficientData && confidence !== undefined && (
            <span className="text-xs text-blue-300/60 font-mono">
              ({(confidence * 100).toFixed(0)}% confidence)
            </span>
          )}
        </div>
        {articlesAnalyzed !== undefined && articlesAnalyzed > 0 && (
          <div className="text-xs text-blue-300/60 mt-1 font-mono">
            Analyzed {articlesAnalyzed} article{articlesAnalyzed !== 1 ? 's' : ''}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="text-sm font-semibold mb-2 text-blue-200">AI Analysis</div>
            <p className="text-sm text-blue-300/80 leading-relaxed">{explanation}</p>
          </div>

          {/* Positive Indicators */}
          {positiveIndicators && positiveIndicators.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Positive Signals</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {positiveIndicators.slice(0, 8).map((indicator, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Negative Indicators */}
          {negativeIndicators && negativeIndicators.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-red-400">
                <XCircle className="h-5 w-5" />
                <span>Negative Signals</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {negativeIndicators.slice(0, 8).map((indicator, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Headlines */}
          {headlines && headlines.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-3 text-blue-200">Recent Headlines</div>
              <ul className="space-y-2">
                {headlines.slice(0, 5).map((headline, idx) => (
                  <li key={idx} className="text-xs text-blue-300/70 flex items-start gap-2 p-2 rounded bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                    <span className="text-blue-500 mt-0.5 font-bold">→</span>
                    <span className="flex-1">{headline}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
