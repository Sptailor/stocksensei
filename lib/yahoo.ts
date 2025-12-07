import yahooFinance from "yahoo-finance2";
import { PriceData } from "./indicators";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface StockHistory {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Fetch current stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || symbol,
      price: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`Failed to fetch stock data for ${symbol}`);
  }
}

/**
 * Fetch historical stock data
 */
export async function getStockHistory(
  symbol: string,
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" = "6mo"
): Promise<StockHistory[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case "1mo":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3mo":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6mo":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "2y":
        startDate.setFullYear(endDate.getFullYear() - 2);
        break;
    }

    // Use chart() instead of deprecated historical()
    const queryOptions = { period1: startDate, period2: endDate, interval: "1d" as const };
    const result = await yahooFinance.chart(symbol, queryOptions);

    if (!result || !result.quotes || result.quotes.length === 0) {
      throw new Error("No historical data available");
    }

    return result.quotes.map((item) => ({
      date: item.date,
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
    }));
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}`);
  }
}

/**
 * Convert StockHistory to PriceData format for indicators
 */
export function convertToPriceData(history: StockHistory[]): PriceData[] {
  return history.map((item) => ({
    date: item.date,
    close: item.close,
    high: item.high,
    low: item.low,
    volume: item.volume,
  }));
}

/**
 * Fetch news headlines for a stock from Yahoo Finance
 */
export async function getStockNews(symbol: string): Promise<string[]> {
  try {
    // Yahoo Finance v2 doesn't have a direct news endpoint
    // We'll use the search module to get news or return empty array
    // In production, you might want to use NewsAPI or another service

    const quote = await yahooFinance.quoteSummary(symbol, {
      modules: ["recommendationTrend"],
    });

    // For now, return a placeholder
    // You can integrate NewsAPI here if needed
    return [
      `${symbol} stock analysis and market trends`,
      `Latest updates on ${symbol} performance`,
      `${symbol} company news and developments`,
    ];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

/**
 * Search for stock symbols
 */
export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
  try {
    const result = await yahooFinance.search(query);

    return result.quotes
      .filter((q) => q.quoteType === "EQUITY")
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
      }));
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return [];
  }
}
