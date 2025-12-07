"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SentimentCardProps {
  sentimentScore: number;
  explanation: string;
  headlines?: string[];
}

export function SentimentCard({ sentimentScore, explanation, headlines }: SentimentCardProps) {
  const getSentimentBadge = (score: number) => {
    if (score >= 0.5) return { label: "Positive", variant: "bullish" as const };
    if (score <= -0.5) return { label: "Negative", variant: "bearish" as const };
    return { label: "Neutral", variant: "neutral" as const };
  };

  const sentiment = getSentimentBadge(sentimentScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Sentiment Analysis</CardTitle>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm text-muted-foreground">Sentiment Score: {sentimentScore.toFixed(2)}</span>
          <Badge variant={sentiment.variant}>{sentiment.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Analysis</div>
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </div>
          {headlines && headlines.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Recent Headlines</div>
              <ul className="space-y-1">
                {headlines.slice(0, 5).map((headline, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {headline}
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
