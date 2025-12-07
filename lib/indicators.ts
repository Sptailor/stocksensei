// Technical Indicators Calculation Library

export interface PriceData {
  date: Date;
  close: number;
  high: number;
  low: number;
  volume: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param data - Array of price data
 * @param period - Number of periods for SMA
 * @returns SMA value
 */
export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) {
    throw new Error(`Not enough data points. Need ${period}, got ${data.length}`);
  }

  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param data - Array of price data
 * @param period - Number of periods for EMA
 * @returns EMA value
 */
export function calculateEMA(data: number[], period: number): number {
  if (data.length < period) {
    throw new Error(`Not enough data points. Need ${period}, got ${data.length}`);
  }

  const multiplier = 2 / (period + 1);

  // Start with SMA for the first EMA value
  const sma = calculateSMA(data.slice(0, period), period);
  let ema = sma;

  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param data - Array of price data
 * @param period - Number of periods for RSI (default: 14)
 * @returns RSI value (0-100)
 */
export function calculateRSI(data: number[], period: number = 14): number {
  if (data.length < period + 1) {
    throw new Error(`Not enough data points. Need ${period + 1}, got ${data.length}`);
  }

  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }

  const gains: number[] = changes.map(change => change > 0 ? change : 0);
  const losses: number[] = changes.map(change => change < 0 ? Math.abs(change) : 0);

  // Calculate average gain and loss
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) {
    return 100; // No losses means RSI is 100
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

/**
 * Calculate technical score based on multiple indicators
 * Returns a score between 0 and 1
 */
export function calculateTechnicalScore(priceData: PriceData[]): number {
  const closePrices = priceData.map(d => d.close);
  const currentPrice = closePrices[closePrices.length - 1];

  try {
    // Calculate indicators
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);
    const rsi = calculateRSI(closePrices, 14);

    // Scoring logic
    let score = 0.5; // Start neutral

    // Price vs SMA (20%)
    if (currentPrice > sma20) score += 0.1;
    if (currentPrice > sma50) score += 0.1;

    // EMA crossover (20%)
    if (ema12 > ema26) score += 0.2;

    // RSI analysis (20%)
    if (rsi > 70) {
      score -= 0.1; // Overbought
    } else if (rsi < 30) {
      score -= 0.1; // Oversold (might bounce)
    } else if (rsi >= 50 && rsi <= 70) {
      score += 0.2; // Healthy bullish
    } else if (rsi >= 30 && rsi < 50) {
      score += 0.1; // Recovering
    }

    // Trend strength (20%)
    const priceChange = (currentPrice - closePrices[0]) / closePrices[0];
    if (priceChange > 0.05) score += 0.1;
    if (priceChange > 0.10) score += 0.1;

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error("Error calculating technical score:", error);
    return 0.5; // Return neutral on error
  }
}

/**
 * Get detailed indicator values
 */
export function getIndicatorDetails(priceData: PriceData[]) {
  const closePrices = priceData.map(d => d.close);

  try {
    return {
      sma20: calculateSMA(closePrices, 20),
      sma50: calculateSMA(closePrices, 50),
      ema12: calculateEMA(closePrices, 12),
      ema26: calculateEMA(closePrices, 26),
      rsi: calculateRSI(closePrices, 14),
      currentPrice: closePrices[closePrices.length - 1],
    };
  } catch (error) {
    console.error("Error getting indicator details:", error);
    return null;
  }
}
