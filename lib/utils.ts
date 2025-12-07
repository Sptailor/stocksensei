import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers (for market cap, volume, etc.)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

/**
 * Get prediction label based on final score
 */
export function getPredictionLabel(score: number): string {
  if (score >= 0.6) return "Bullish";
  if (score >= 0.4) return "Neutral";
  return "Bearish";
}

/**
 * Get color class based on prediction label
 */
export function getPredictionColor(label: string): string {
  switch (label) {
    case "Bullish":
      return "text-green-600 dark:text-green-400";
    case "Bearish":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-yellow-600 dark:text-yellow-400";
  }
}

/**
 * Normalize sentiment score from -1..1 to 0..1
 */
export function normalizeSentiment(score: number): number {
  return (score + 1) / 2;
}
