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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>News Sentiment Analysis</CardTitle>
          <SentimentIcon className={`h-5 w-5 ${sentimentScore >= 0.3 ? 'text-green-600' : sentimentScore <= -0.3 ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {!isInsufficientData && (
            <span className="text-sm text-muted-foreground">
              Score: {sentimentScore.toFixed(2)}
            </span>
          )}
          <Badge variant={sentiment.variant}>{displayLabel}</Badge>
          {!isInsufficientData && confidence !== undefined && (
            <span className="text-xs text-muted-foreground">
              ({(confidence * 100).toFixed(0)}% confidence)
            </span>
          )}
        </div>
        {articlesAnalyzed !== undefined && articlesAnalyzed > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            Analyzed {articlesAnalyzed} article{articlesAnalyzed !== 1 ? 's' : ''}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Analysis</div>
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </div>

          {/* Positive Indicators */}
          {positiveIndicators && positiveIndicators.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium mb-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Positive Signals</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {positiveIndicators.slice(0, 8).map((indicator, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-green-200 dark:border-green-800">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Negative Indicators */}
          {negativeIndicators && negativeIndicators.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium mb-2 text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                <span>Negative Signals</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {negativeIndicators.slice(0, 8).map((indicator, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-red-200 dark:border-red-800">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Headlines */}
          {headlines && headlines.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Recent Headlines</div>
              <ul className="space-y-1.5">
                {headlines.slice(0, 5).map((headline, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
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
