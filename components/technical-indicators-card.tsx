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
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-100">
          <span>Technical Indicators</span>
          <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <span className="text-sm font-mono text-blue-300">{(score * 100).toFixed(1)}%</span>
          </div>
        </CardTitle>
        <CardDescription className="text-blue-300/60">
          Advanced market metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="text-xs text-blue-300/70 mb-1 font-mono">SMA 20</div>
            <div className="text-xl font-bold text-blue-100">${indicators.sma20.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="text-xs text-purple-300/70 mb-1 font-mono">SMA 50</div>
            <div className="text-xl font-bold text-purple-100">${indicators.sma50.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
            <div className="text-xs text-cyan-300/70 mb-1 font-mono">EMA 12</div>
            <div className="text-xl font-bold text-cyan-100">${indicators.ema12.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
            <div className="text-xs text-indigo-300/70 mb-1 font-mono">EMA 26</div>
            <div className="text-xl font-bold text-indigo-100">${indicators.ema26.toFixed(2)}</div>
          </div>
          <div className="col-span-2 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30">
            <div className="text-xs text-blue-300/70 mb-2 font-mono">RSI (14)</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-100">{indicators.rsi.toFixed(2)}</div>
              <Badge
                variant={rsiStatus.variant}
                className={`${
                  rsiStatus.variant === 'destructive'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : rsiStatus.variant === 'secondary'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                } border`}
              >
                {rsiStatus.label}
              </Badge>
            </div>
            <div className="mt-2 w-full bg-slate-800/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  indicators.rsi > 70 ? 'bg-red-500' : indicators.rsi < 30 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${indicators.rsi}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
