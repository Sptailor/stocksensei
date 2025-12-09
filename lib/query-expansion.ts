/**
 * Query Expansion System
 * Generates multiple search queries to maximize article retrieval
 */

import { type TickerInfo } from "./ticker-resolver";

export interface ExpandedQuery {
  query: string;
  priority: number; // 1 = highest, 5 = lowest
  type: "symbol" | "company" | "product" | "executive" | "event" | "industry";
}

/**
 * Generate expanded search queries for a ticker
 */
export function generateExpandedQueries(tickerInfo: TickerInfo): ExpandedQuery[] {
  const queries: ExpandedQuery[] = [];

  // Priority 1: Direct ticker and company name
  queries.push({
    query: tickerInfo.symbol,
    priority: 1,
    type: "symbol",
  });

  if (tickerInfo.name) {
    queries.push({
      query: tickerInfo.name,
      priority: 1,
      type: "company",
    });
  }

  // Priority 2: Stock-specific variations
  queries.push({
    query: `${tickerInfo.symbol} stock`,
    priority: 2,
    type: "symbol",
  });

  if (tickerInfo.shortName) {
    queries.push({
      query: `${tickerInfo.shortName} stock`,
      priority: 2,
      type: "company",
    });
  }

  // Priority 3: News and earnings queries
  queries.push({
    query: `${tickerInfo.symbol} news`,
    priority: 3,
    type: "symbol",
  });

  queries.push({
    query: `${tickerInfo.symbol} earnings`,
    priority: 3,
    type: "event",
  });

  if (tickerInfo.shortName) {
    queries.push({
      query: `${tickerInfo.shortName} earnings`,
      priority: 3,
      type: "event",
    });
  }

  // Priority 4: Ticker-specific keywords (products, executives, etc.)
  const specificQueries = getTickerSpecificQueries(tickerInfo.symbol);
  queries.push(...specificQueries);

  // Remove duplicates
  const uniqueQueries = deduplicateQueries(queries);

  return uniqueQueries;
}

/**
 * Get ticker-specific search queries (products, executives, etc.)
 */
function getTickerSpecificQueries(symbol: string): ExpandedQuery[] {
  const queries: ExpandedQuery[] = [];

  const tickerKeywords: Record<string, string[]> = {
    // Tech Giants
    AAPL: ["iPhone", "iPad", "Mac", "Tim Cook", "Apple Watch", "M-series", "App Store", "iOS", "MacBook"],
    TSLA: ["Tesla Model", "Elon Musk", "Cybertruck", "Tesla battery", "EV deliveries", "Gigafactory"],
    MSFT: ["Windows", "Azure", "Office 365", "Satya Nadella", "Xbox", "Microsoft Teams", "AI Copilot"],
    GOOGL: ["Google Search", "Sundar Pichai", "YouTube", "Android", "Google Cloud", "Pixel", "Chrome"],
    GOOG: ["Google Search", "Sundar Pichai", "YouTube", "Android", "Google Cloud", "Pixel", "Chrome"],
    AMZN: ["AWS", "Jeff Bezos", "Andy Jassy", "Amazon Prime", "Alexa", "Amazon Web Services", "Amazon retail", "e-commerce", "Prime Day"],
    META: ["Facebook", "Instagram", "WhatsApp", "Mark Zuckerberg", "Meta Quest", "Threads", "Metaverse"],
    NVDA: ["Nvidia GPU", "Jensen Huang", "RTX", "AI chips", "CUDA", "GeForce"],

    // Finance
    JPM: ["Jamie Dimon", "JPMorgan Chase", "JPM earnings", "investment banking"],
    BAC: ["Bank of America", "BofA", "Brian Moynihan"],
    GS: ["Goldman Sachs", "David Solomon", "investment banking"],
    MS: ["Morgan Stanley", "James Gorman"],
    V: ["Visa payment", "credit card", "payment processing"],
    MA: ["Mastercard payment", "credit card processing"],

    // Retail
    WMT: ["Walmart stores", "Doug McMillon", "Walmart earnings", "retail sales"],
    COST: ["Costco warehouse", "membership"],

    // Healthcare/Pharma
    JNJ: ["Johnson & Johnson", "J&J", "pharmaceuticals"],
    PFE: ["Pfizer vaccine", "Pfizer drug", "Albert Bourla"],
    ABBV: ["AbbVie drug", "Humira", "pharmaceutical"],

    // Automotive
    F: ["Ford F-150", "Ford Mustang", "Jim Farley", "Ford EV"],
    GM: ["General Motors", "Mary Barra", "GM electric", "Chevrolet"],

    // Energy
    XOM: ["ExxonMobil", "Exxon", "oil production", "energy sector"],
    CVX: ["Chevron oil", "energy production"],

    // Consumer Goods
    KO: ["Coca-Cola", "Coke", "James Quincey", "beverage"],
    PEP: ["Pepsi", "PepsiCo", "Ramon Laguarta", "beverage"],
    NKE: ["Nike shoes", "athletic wear", "John Donahoe", "sportswear"],

    // Semiconductors
    AMD: ["AMD processor", "Lisa Su", "Ryzen", "EPYC", "GPU"],
    INTC: ["Intel chip", "Pat Gelsinger", "processor", "semiconductor"],
    QCOM: ["Qualcomm chip", "Snapdragon", "5G technology"],

    // Entertainment
    DIS: ["Disney parks", "Bob Iger", "Disney+", "Marvel", "streaming"],
    NFLX: ["Netflix streaming", "Netflix series", "subscription"],

    // E-commerce/Payments
    PYPL: ["PayPal payment", "digital payment", "Venmo"],
    SQ: ["Square payment", "Block Inc", "Cash App"],
    SHOP: ["Shopify platform", "e-commerce platform"],
  };

  const keywords = tickerKeywords[symbol.toUpperCase()] || [];

  // Add product/executive queries
  keywords.forEach((keyword, idx) => {
    queries.push({
      query: keyword,
      priority: 4,
      type: idx < 3 ? "product" : "executive", // First few are products, rest are executives
    });
  });

  return queries;
}

/**
 * Deduplicate queries
 */
function deduplicateQueries(queries: ExpandedQuery[]): ExpandedQuery[] {
  const seen = new Set<string>();
  const unique: ExpandedQuery[] = [];

  for (const query of queries) {
    const normalized = query.query.toLowerCase().trim();
    if (!seen.has(normalized) && normalized.length > 0) {
      seen.add(normalized);
      unique.push(query);
    }
  }

  return unique;
}

/**
 * Get priority-ordered queries (use in order until enough articles found)
 */
export function getPriorityOrderedQueries(tickerInfo: TickerInfo): ExpandedQuery[] {
  const allQueries = generateExpandedQueries(tickerInfo);

  // Sort by priority (1 = highest)
  return allQueries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Within same priority, prefer symbol/company types
    const typeOrder = { symbol: 1, company: 2, event: 3, product: 4, executive: 5, industry: 6 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
}

/**
 * Get query batches (group by priority for parallel fetching)
 */
export function getQueryBatches(tickerInfo: TickerInfo): ExpandedQuery[][] {
  const queries = getPriorityOrderedQueries(tickerInfo);
  const batches: ExpandedQuery[][] = [];

  let currentBatch: ExpandedQuery[] = [];
  let currentPriority = 0;

  for (const query of queries) {
    if (query.priority !== currentPriority) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }
      currentBatch = [query];
      currentPriority = query.priority;
    } else {
      currentBatch.push(query);
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

/**
 * Log query expansion results
 */
export function logQueryExpansion(tickerInfo: TickerInfo): void {
  console.log(`\n=== Query Expansion for ${tickerInfo.symbol} ===`);

  const batches = getQueryBatches(tickerInfo);

  batches.forEach((batch, idx) => {
    console.log(`\nPriority ${batch[0].priority} (Batch ${idx + 1}):`);
    batch.forEach(query => {
      console.log(`  - "${query.query}" [${query.type}]`);
    });
  });

  const total = batches.reduce((sum, batch) => sum + batch.length, 0);
  console.log(`\nTotal queries: ${total}`);
  console.log("=".repeat(50) + "\n");
}
