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

export interface TechnicalAnalysis {
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  smaSignal: -1 | 0 | 1;
  emaSignal: -1 | 0 | 1;
  rsiSignal: -1 | 0 | 1;
  rawScore: number;
  finalScore: number;
}

/**
 * Calculate technical score based on 3 indicators
 * Each indicator returns -1, 0, or +1
 * Final score: ((raw_score + 3) / 6) * 100
 * Returns a score between 0 and 100
 */
export function calculateTechnicalScore(priceData: PriceData[]): number {
  const analysis = calculateTechnicalAnalysis(priceData);
  return analysis.finalScore;
}

/**
 * Calculate full technical analysis with indicator values and signals
 * @param priceData - Array of price data
 * @returns TechnicalAnalysis object with all indicator values and final score
 */
export function calculateTechnicalAnalysis(priceData: PriceData[]): TechnicalAnalysis {
  const closePrices = priceData.map(d => d.close);

  try {
    // Calculate indicators
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);
    const rsi = calculateRSI(closePrices, 14);

    // 1. SMA Crossover Signal
    let smaSignal: -1 | 0 | 1;
    if (sma20 > sma50) {
      smaSignal = 1; // Bullish
    } else if (sma20 < sma50) {
      smaSignal = -1; // Bearish
    } else {
      smaSignal = 0; // Neutral
    }

    // 2. EMA Crossover Signal
    let emaSignal: -1 | 0 | 1;
    if (ema12 > ema26) {
      emaSignal = 1; // Bullish
    } else if (ema12 < ema26) {
      emaSignal = -1; // Bearish
    } else {
      emaSignal = 0; // Neutral
    }

    // 3. RSI Signal
    let rsiSignal: -1 | 0 | 1;
    if (rsi < 30) {
      rsiSignal = 1; // Oversold - Bullish
    } else if (rsi > 70) {
      rsiSignal = -1; // Overbought - Bearish
    } else {
      rsiSignal = 0; // Neutral
    }

    // Calculate raw score (sum of signals: -3 to +3)
    const rawScore = smaSignal + emaSignal + rsiSignal;

    // Normalize to 0-100
    const finalScore = ((rawScore + 3) / 6) * 100;

    return {
      sma20,
      sma50,
      ema12,
      ema26,
      rsi,
      smaSignal,
      emaSignal,
      rsiSignal,
      rawScore,
      finalScore,
    };
  } catch (error) {
    console.error("Error calculating technical analysis:", error);
    // Return neutral values on error
    return {
      sma20: 0,
      sma50: 0,
      ema12: 0,
      ema26: 0,
      rsi: 50,
      smaSignal: 0,
      emaSignal: 0,
      rsiSignal: 0,
      rawScore: 0,
      finalScore: 50,
    };
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
