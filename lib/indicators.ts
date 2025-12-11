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

export interface VolumeMetrics {
  avgVolume20: number;
  relativeVolume: number;
  isHighVolume: boolean;
  isLowVolume: boolean;
  volumeSpikes: number[]; // indices where volume spiked
}

export interface CompressionZone {
  startIndex: number;
  endIndex: number;
  highPrice: number;
  lowPrice: number;
  avgVolume: number;
}

export interface Breakout {
  index: number;
  type: 'bullish' | 'bearish';
  confirmed: boolean; // volume confirmation
  price: number;
  volume: number;
  relativeVolume: number;
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
  volumeMetrics?: VolumeMetrics;
  compressionZones?: CompressionZone[];
  breakouts?: Breakout[];
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

// ============================================================================
// VOLUME ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Calculate volume metrics including average volume and relative volume
 */
export function calculateVolumeMetrics(priceData: PriceData[]): VolumeMetrics {
  const volumes = priceData.map(d => d.volume);

  // Calculate 20-period average volume
  const avgVolume20 = calculateSMA(volumes, 20);

  // Current relative volume (RVOL)
  const currentVolume = volumes[volumes.length - 1];
  const relativeVolume = currentVolume / avgVolume20;

  // Identify volume spikes (RVOL >= 1.5)
  const volumeSpikes: number[] = [];
  for (let i = Math.max(0, volumes.length - 50); i < volumes.length; i++) {
    const rvol = volumes[i] / avgVolume20;
    if (rvol >= 1.5) {
      volumeSpikes.push(i);
    }
  }

  return {
    avgVolume20,
    relativeVolume,
    isHighVolume: relativeVolume >= 1.5,
    isLowVolume: relativeVolume < 0.6,
    volumeSpikes,
  };
}

/**
 * Detect compression zones (low volatility + low volume)
 */
export function detectCompressionZones(priceData: PriceData[]): CompressionZone[] {
  if (priceData.length < 20) return [];

  const compressionZones: CompressionZone[] = [];
  const volumes = priceData.map(d => d.volume);

  // Calculate average volume
  const avgVolume = calculateSMA(volumes, 20);

  // Calculate average price range for the last 20 periods
  const ranges: number[] = [];
  for (let i = 0; i < priceData.length; i++) {
    ranges.push(priceData[i].high - priceData[i].low);
  }
  const avgRange = calculateSMA(ranges, 20);

  // Scan for compression zones
  let compressionStart = -1;

  for (let i = 20; i < priceData.length; i++) {
    const currentRange = priceData[i].high - priceData[i].low;
    const currentVolume = volumes[i];

    // Check if we're in compression (made more sensitive)
    const isNarrowRange = currentRange < 0.75 * avgRange; // Increased from 0.6 to 0.75
    const isLowVolume = currentVolume < 0.8 * avgVolume; // Increased from 0.6 to 0.8

    if (isNarrowRange && isLowVolume) {
      if (compressionStart === -1) {
        compressionStart = i;
      }
    } else {
      // End of compression zone
      if (compressionStart !== -1 && (i - compressionStart) >= 2) { // Reduced from 3 to 2
        const zoneData = priceData.slice(compressionStart, i);
        compressionZones.push({
          startIndex: compressionStart,
          endIndex: i - 1,
          highPrice: Math.max(...zoneData.map(d => d.high)),
          lowPrice: Math.min(...zoneData.map(d => d.low)),
          avgVolume: zoneData.reduce((sum, d) => sum + d.volume, 0) / zoneData.length,
        });
      }
      compressionStart = -1;
    }
  }

  // Check if we ended in compression
  if (compressionStart !== -1 && (priceData.length - compressionStart) >= 2) { // Reduced from 3 to 2
    const zoneData = priceData.slice(compressionStart);
    compressionZones.push({
      startIndex: compressionStart,
      endIndex: priceData.length - 1,
      highPrice: Math.max(...zoneData.map(d => d.high)),
      lowPrice: Math.min(...zoneData.map(d => d.low)),
      avgVolume: zoneData.reduce((sum, d) => sum + d.volume, 0) / zoneData.length,
    });
  }

  return compressionZones;
}

/**
 * Detect breakouts after compression zones
 */
export function detectBreakouts(
  priceData: PriceData[],
  compressionZones: CompressionZone[]
): Breakout[] {
  if (compressionZones.length === 0) return [];

  const breakouts: Breakout[] = [];
  const volumes = priceData.map(d => d.volume);
  const avgVolume = calculateSMA(volumes, 20);

  for (const zone of compressionZones) {
    // Look for breakouts within 5 bars after compression ends
    const searchEnd = Math.min(zone.endIndex + 5, priceData.length - 1);

    for (let i = zone.endIndex + 1; i <= searchEnd; i++) {
      const bar = priceData[i];
      const relativeVolume = bar.volume / avgVolume;

      // Bullish breakout: close above compression high with volume confirmation
      if (bar.close > zone.highPrice) {
        breakouts.push({
          index: i,
          type: 'bullish',
          confirmed: relativeVolume >= 1.2, // Reduced from 1.5 to 1.2
          price: bar.close,
          volume: bar.volume,
          relativeVolume,
        });
        break; // Only count first breakout per zone
      }

      // Bearish breakout: close below compression low with volume confirmation
      if (bar.close < zone.lowPrice) {
        breakouts.push({
          index: i,
          type: 'bearish',
          confirmed: relativeVolume >= 1.2, // Reduced from 1.5 to 1.2
          price: bar.close,
          volume: bar.volume,
          relativeVolume,
        });
        break;
      }
    }
  }

  return breakouts;
}

/**
 * Get complete volume analysis including metrics, compression zones, and breakouts
 */
export function getVolumeAnalysis(priceData: PriceData[]) {
  try {
    const volumeMetrics = calculateVolumeMetrics(priceData);
    const compressionZones = detectCompressionZones(priceData);
    const breakouts = detectBreakouts(priceData, compressionZones);

    return {
      volumeMetrics,
      compressionZones,
      breakouts,
    };
  } catch (error) {
    console.error("Error in volume analysis:", error);
    return {
      volumeMetrics: {
        avgVolume20: 0,
        relativeVolume: 1,
        isHighVolume: false,
        isLowVolume: false,
        volumeSpikes: [],
      },
      compressionZones: [],
      breakouts: [],
    };
  }
}
