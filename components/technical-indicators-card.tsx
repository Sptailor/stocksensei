"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface VolumeMetrics {
  avgVolume20: number;
  relativeVolume: number;
  isHighVolume: boolean;
  isLowVolume: boolean;
  volumeSpikes: number[];
}

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
  volumeAnalysis?: {
    volumeMetrics: VolumeMetrics;
    compressionZones: unknown[];
    breakouts: unknown[];
  };
}

export function TechnicalIndicatorsCard({ indicators, score, volumeAnalysis }: TechnicalIndicatorsCardProps) {
  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return { label: "Overbought", variant: "destructive" as const };
    if (rsi < 30) return { label: "Oversold", variant: "secondary" as const };
    return { label: "Normal", variant: "outline" as const };
  };

  const getVolumeStatus = (rvol: number) => {
    if (rvol >= 1.5) return { label: "High Volume", variant: "default" as const, icon: TrendingUp };
    if (rvol < 0.6) return { label: "Low Volume", variant: "secondary" as const, icon: TrendingDown };
    return { label: "Normal Volume", variant: "outline" as const, icon: Activity };
  };

  const rsiStatus = getRSIStatus(indicators.rsi);
  const volumeMetrics = volumeAnalysis?.volumeMetrics;
  const volumeStatus = volumeMetrics ? getVolumeStatus(volumeMetrics.relativeVolume) : null;

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-100">
          <span>Technical Indicators</span>
          <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <span className="text-sm font-mono text-blue-300">{score.toFixed(1)}%</span>
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

          {/* Volume Metrics */}
          {volumeMetrics && (
            <>
              <div className="col-span-2 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30">
                <div className="text-xs text-emerald-300/70 mb-2 font-mono">Volume Analysis</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-emerald-300/60 mb-1">Avg Volume (20d)</div>
                    <div className="text-lg font-bold text-emerald-100">
                      {(volumeMetrics.avgVolume20 / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-teal-300/60 mb-1">Relative Volume</div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-teal-100">
                        {volumeMetrics.relativeVolume.toFixed(2)}x
                      </div>
                      {volumeStatus && (
                        <Badge
                          variant={volumeStatus.variant}
                          className={`${
                            volumeMetrics.isHighVolume
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : volumeMetrics.isLowVolume
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          } border flex items-center gap-1`}
                        >
                          <volumeStatus.icon className="h-3 w-3" />
                          {volumeStatus.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {volumeMetrics.volumeSpikes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20">
                    <div className="text-xs text-emerald-300/60">
                      🔥 {volumeMetrics.volumeSpikes.length} volume spike{volumeMetrics.volumeSpikes.length > 1 ? 's' : ''} detected in last 50 periods
                    </div>
                  </div>
                )}
              </div>

              {/* Compression & Breakout Summary */}
              {(volumeAnalysis.compressionZones.length > 0 || volumeAnalysis.breakouts.length > 0) && (
                <div className="col-span-2 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/30">
                  <div className="text-xs text-yellow-300/70 mb-2 font-mono">Pattern Detection</div>
                  <div className="space-y-2">
                    {volumeAnalysis.compressionZones.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-100">Compression Zones</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                          {volumeAnalysis.compressionZones.length} found
                        </Badge>
                      </div>
                    )}
                    {volumeAnalysis.breakouts.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-100">Breakouts Detected</span>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border">
                          {volumeAnalysis.breakouts.length} signal{volumeAnalysis.breakouts.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
