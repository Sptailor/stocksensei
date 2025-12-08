"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface StockChartProps {
  data: Array<{
    date: Date;
    close: number;
    volume: number;
  }>;
}

export function StockChart({ data }: StockChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    price: item.close,
  }));

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-100 flex items-center gap-2">
          <span>Price History</span>
          <span className="text-sm font-normal text-blue-300/60">(6 Months)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'rgba(147, 197, 253, 0.7)' }}
              stroke="rgba(59, 130, 246, 0.3)"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgba(147, 197, 253, 0.7)' }}
              stroke="rgba(59, 130, 246, 0.3)"
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "rgb(191, 219, 254)" }}
              itemStyle={{ color: "rgb(96, 165, 250)" }}
            />
            <Legend
              wrapperStyle={{ color: "rgb(147, 197, 253)" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Stock Price"
              fill="url(#colorPrice)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
