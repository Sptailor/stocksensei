"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TechnicalIndicatorsCardProps {
  indicators: {
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
    rsi: number;
    currentPrice: number;
  };
  score: number;
}

export function TechnicalIndicatorsCard({ indicators, score }: TechnicalIndicatorsCardProps) {
  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return { label: "Overbought", variant: "destructive" as const };
    if (rsi < 30) return { label: "Oversold", variant: "secondary" as const };
    return { label: "Normal", variant: "outline" as const };
  };

  const rsiStatus = getRSIStatus(indicators.rsi);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Indicators</CardTitle>
        <CardDescription>
          Technical Score: {(score * 100).toFixed(1)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">SMA 20</div>
            <div className="text-lg font-semibold">${indicators.sma20.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">SMA 50</div>
            <div className="text-lg font-semibold">${indicators.sma50.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">EMA 12</div>
            <div className="text-lg font-semibold">${indicators.ema12.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">EMA 26</div>
            <div className="text-lg font-semibold">${indicators.ema26.toFixed(2)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground mb-1">RSI (14)</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{indicators.rsi.toFixed(2)}</div>
              <Badge variant={rsiStatus.variant}>{rsiStatus.label}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
