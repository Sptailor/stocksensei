/**
 * Ticker Symbol to Company Name Resolver
 * Resolves stock tickers to company names for relevance filtering
 */

import yahooFinance from "yahoo-finance2";

// Cache for ticker -> company name mappings
const tickerCache = new Map<string, TickerInfo>();

export interface TickerInfo {
  symbol: string;
  name: string;
  shortName?: string;
  longName?: string;
  aliases: string[]; // Common variations and abbreviations
}

/**
 * Get company information for a ticker symbol
 */
export async function getTickerInfo(symbol: string): Promise<TickerInfo> {
  const normalizedSymbol = symbol.toUpperCase().trim();

  // Check cache first
  if (tickerCache.has(normalizedSymbol)) {
    return tickerCache.get(normalizedSymbol)!;
  }

  try {
    // Fetch from Yahoo Finance
    const quote = await yahooFinance.quote(normalizedSymbol);

    const shortName = quote.shortName || quote.displayName || "";
    const longName = quote.longName || quote.displayName || "";

    // Generate aliases (common variations)
    const aliases = generateAliases(normalizedSymbol, shortName, longName);

    const tickerInfo: TickerInfo = {
      symbol: normalizedSymbol,
      name: longName || shortName || normalizedSymbol,
      shortName,
      longName,
      aliases,
    };

    // Cache the result
    tickerCache.set(normalizedSymbol, tickerInfo);

    return tickerInfo;
  } catch (error) {
    console.error(`Failed to fetch ticker info for ${normalizedSymbol}:`, error);

    // Return minimal info with just the symbol
    const fallbackInfo: TickerInfo = {
      symbol: normalizedSymbol,
      name: normalizedSymbol,
      aliases: [normalizedSymbol],
    };

    tickerCache.set(normalizedSymbol, fallbackInfo);
    return fallbackInfo;
  }
}

/**
 * Generate common aliases for a company
 */
function generateAliases(symbol: string, shortName: string, longName: string): string[] {
  const aliases = new Set<string>();

  // Add the symbol itself
  aliases.add(symbol.toUpperCase());

  // Add short name
  if (shortName) {
    aliases.add(shortName);
    // Remove common suffixes
    const cleaned = shortName
      .replace(/\s+(Inc\.?|Corp\.?|Corporation|Ltd\.?|Limited|Company|Co\.?|Group|Holdings?)$/i, "")
      .trim();
    if (cleaned) aliases.add(cleaned);
  }

  // Add long name
  if (longName) {
    aliases.add(longName);
    // Remove common suffixes
    const cleaned = longName
      .replace(/\s+(Inc\.?|Corp\.?|Corporation|Ltd\.?|Limited|Company|Co\.?|Group|Holdings?)$/i, "")
      .trim();
    if (cleaned) aliases.add(cleaned);
  }

  // Special handling for common companies
  const specialAliases = getSpecialAliases(symbol);
  specialAliases.forEach(alias => aliases.add(alias));

  return Array.from(aliases).filter(a => a.length > 0);
}

/**
 * Special aliases for well-known companies
 */
function getSpecialAliases(symbol: string): string[] {
  const special: Record<string, string[]> = {
    AAPL: ["Apple", "Apple Inc", "iPhone", "iPad", "Mac"],
    TSLA: ["Tesla", "Tesla Motors", "Tesla Inc"],
    MSFT: ["Microsoft", "Microsoft Corporation"],
    GOOGL: ["Google", "Alphabet", "Alphabet Inc"],
    GOOG: ["Google", "Alphabet", "Alphabet Inc"],
    AMZN: ["Amazon", "Amazon.com", "AWS"],
    META: ["Meta", "Facebook", "Meta Platforms"],
    NVDA: ["NVIDIA", "Nvidia", "Nvidia Corporation"],
    AMD: ["AMD", "Advanced Micro Devices"],
    INTC: ["Intel", "Intel Corporation"],
    NFLX: ["Netflix", "Netflix Inc"],
    DIS: ["Disney", "Walt Disney", "The Walt Disney Company"],
    BA: ["Boeing", "The Boeing Company"],
    V: ["Visa", "Visa Inc"],
    MA: ["Mastercard", "MasterCard"],
    JPM: ["JPMorgan", "JP Morgan", "JPMorgan Chase"],
    BAC: ["Bank of America", "BofA"],
    WMT: ["Walmart", "Wal-Mart"],
    PG: ["Procter & Gamble", "P&G"],
    JNJ: ["Johnson & Johnson", "J&J"],
    UNH: ["UnitedHealth", "United Health Group"],
    HD: ["Home Depot", "The Home Depot"],
    CVX: ["Chevron", "Chevron Corporation"],
    XOM: ["Exxon", "ExxonMobil", "Exxon Mobil"],
    KO: ["Coca-Cola", "Coca Cola", "Coke"],
    PEP: ["Pepsi", "PepsiCo"],
    NKE: ["Nike", "Nike Inc"],
    MCD: ["McDonald's", "McDonalds"],
    SBUX: ["Starbucks", "Starbucks Corporation"],
    COST: ["Costco", "Costco Wholesale"],
    WFC: ["Wells Fargo", "Wells Fargo & Company"],
    GS: ["Goldman Sachs", "Goldman Sachs Group"],
    MS: ["Morgan Stanley"],
    C: ["Citigroup", "Citi"],
    PYPL: ["PayPal", "PayPal Holdings"],
    ADBE: ["Adobe", "Adobe Inc"],
    CRM: ["Salesforce", "Salesforce.com"],
    ORCL: ["Oracle", "Oracle Corporation"],
    IBM: ["IBM", "International Business Machines"],
    CSCO: ["Cisco", "Cisco Systems"],
    QCOM: ["Qualcomm", "Qualcomm Inc"],
    TMO: ["Thermo Fisher", "Thermo Fisher Scientific"],
    ABT: ["Abbott", "Abbott Laboratories"],
    BMY: ["Bristol-Myers", "Bristol Myers Squibb"],
    PFE: ["Pfizer", "Pfizer Inc"],
    MRK: ["Merck", "Merck & Co"],
    LLY: ["Eli Lilly", "Lilly"],
    ABBV: ["AbbVie", "AbbVie Inc"],
    T: ["AT&T", "AT&T Inc"],
    VZ: ["Verizon", "Verizon Communications"],
    CMCSA: ["Comcast", "Comcast Corporation"],
  };

  return special[symbol.toUpperCase()] || [];
}

/**
 * Clear the ticker cache (useful for testing or manual refresh)
 */
export function clearTickerCache(): void {
  tickerCache.clear();
}
