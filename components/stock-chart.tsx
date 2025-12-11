"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceDot,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface CompressionZone {
  startIndex: number;
  endIndex: number;
  highPrice: number;
  lowPrice: number;
  avgVolume: number;
}

interface Breakout {
  index: number;
  type: 'bullish' | 'bearish';
  confirmed: boolean;
  price: number;
  volume: number;
  relativeVolume: number;
}

interface VolumeMetrics {
  avgVolume20: number;
  relativeVolume: number;
  isHighVolume: boolean;
  isLowVolume: boolean;
  volumeSpikes: number[];
}

interface StockChartProps {
  data: Array<{
    date: Date;
    close: number;
    high: number;
    low: number;
    volume: number;
  }>;
  volumeAnalysis?: {
    volumeMetrics: VolumeMetrics;
    compressionZones: CompressionZone[];
    breakouts: Breakout[];
  };
}

export function StockChart({ data, volumeAnalysis }: StockChartProps) {
  // Prepare chart data with volume coloring
  const avgVolume = volumeAnalysis?.volumeMetrics.avgVolume20 || 0;
  const volumeSpikes = new Set(volumeAnalysis?.volumeMetrics.volumeSpikes || []);

  const chartData = data.map((item, index) => {
    const isSpike = volumeSpikes.has(index);
    const isLowVolume = avgVolume > 0 && item.volume < avgVolume * 0.6;

    return {
      date: format(new Date(item.date), "MMM dd"),
      price: item.close,
      volume: item.volume,
      volumeColor: isSpike ? '#10b981' : isLowVolume ? '#ef4444' : '#6366f1',
      index,
    };
  });

  // Get compression zones and breakouts
  const compressionZones = volumeAnalysis?.compressionZones || [];
  const breakouts = volumeAnalysis?.breakouts || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      color: string;
      payload: {
        date: string;
        price: number;
        volume: number;
        volumeColor: string;
        index: number;
      };
    }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-blue-500/30 rounded-lg p-3 backdrop-blur-xl">
          <p className="text-blue-100 font-semibold mb-2">{data.date}</p>
          <p className="text-blue-300 text-sm">Price: ${data.price?.toFixed(2)}</p>
          <p className="text-blue-300 text-sm">
            Volume: {(data.volume / 1000000).toFixed(2)}M
          </p>
          {avgVolume > 0 && (
            <p className="text-blue-300 text-sm">
              RVOL: {(data.volume / avgVolume).toFixed(2)}x
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-100 flex items-center gap-2">
            <span>Price & Volume Analysis</span>
            <span className="text-sm font-normal text-blue-300/60">(6 Months)</span>
          </CardTitle>
          <div className="flex gap-2 text-xs">
            {compressionZones.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded border border-yellow-500/30">
                <AlertTriangle className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-300">{compressionZones.length} Compression{compressionZones.length > 1 ? 's' : ''}</span>
              </div>
            )}
            {breakouts.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded border border-green-500/30">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-green-300">{breakouts.length} Breakout{breakouts.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Chart */}
        <div>
          <h3 className="text-sm text-blue-300/70 mb-2 font-mono">Price Chart</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(147, 197, 253, 0.7)' }}
                stroke="rgba(59, 130, 246, 0.3)"
              />
              <YAxis
                yAxisId="price"
                tick={{ fontSize: 10, fill: 'rgba(147, 197, 253, 0.7)' }}
                stroke="rgba(59, 130, 246, 0.3)"
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Compression Zones */}
              {compressionZones.map((zone, i) => (
                <ReferenceArea
                  key={`compression-${i}`}
                  yAxisId="price"
                  x1={chartData[zone.startIndex]?.date}
                  x2={chartData[zone.endIndex]?.date}
                  y1={zone.lowPrice}
                  y2={zone.highPrice}
                  fill="#fbbf24"
                  fillOpacity={0.15}
                  stroke="#fbbf24"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
              ))}

              {/* Breakout Markers */}
              {breakouts.map((breakout, i) => (
                <ReferenceDot
                  key={`breakout-${i}`}
                  yAxisId="price"
                  x={chartData[breakout.index]?.date}
                  y={breakout.price}
                  r={8}
                  fill={breakout.type === 'bullish' ? '#10b981' : '#ef4444'}
                  stroke={breakout.confirmed ? '#ffffff' : '#94a3b8'}
                  strokeWidth={breakout.confirmed ? 2 : 1}
                  label={{
                    value: breakout.type === 'bullish' ? '🚀' : '📉',
                    position: 'top',
                    fontSize: 16,
                  }}
                />
              ))}

              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div>
          <h3 className="text-sm text-blue-300/70 mb-2 font-mono flex items-center gap-2">
            Volume Histogram
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 rounded border border-blue-500/30">
              Avg: {(avgVolume / 1000000).toFixed(2)}M
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(147, 197, 253, 0.7)' }}
                stroke="rgba(59, 130, 246, 0.3)"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(147, 197, 253, 0.7)' }}
                stroke="rgba(59, 130, 246, 0.3)"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="volume"
                fill="#6366f1"
                opacity={0.8}
                shape={(props: unknown) => {
                  const { x, y, width, height, payload } = props as {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    payload: { volumeColor: string };
                  };
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={payload.volumeColor}
                      opacity={0.8}
                    />
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-blue-300/70">High Volume (≥1.5x avg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span className="text-blue-300/70">Normal Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-blue-300/70">Low Volume (&lt;0.6x avg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-yellow-500/20 border border-yellow-500/50 rounded"></div>
            <span className="text-blue-300/70">Compression Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚀</span>
            <span className="text-blue-300/70">Confirmed Breakout</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
