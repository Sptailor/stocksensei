/**
 * Multi-Source News Fetcher with Fallbacks
 * Fetches stock news from multiple free APIs with quality checks
 * Now includes ticker-specific relevance filtering
 */

import { getTickerInfo, type TickerInfo } from "./ticker-resolver";
import { filterRelevantArticles, logRelevanceFiltering } from "./article-relevance";

export interface NewsArticle {
  title: string;
  description?: string;
  content?: string;
  publishedAt: Date | string;
  source?: string;
  url?: string;
  symbols?: string[]; // Ticker symbols mentioned in article metadata
  quality?: "high" | "medium" | "low";
}

interface NewsSource {
  name: string;
  fetcher: (symbol: string) => Promise<NewsArticle[]>;
  priority: number;
}

// ============================================================================
// NEWS SOURCE IMPLEMENTATIONS
// ============================================================================

/**
 * Yahoo Finance News (Primary Source)
 */
async function fetchYahooFinanceNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const YahooFinance = (await import("yahoofinance")).default;
    const yahooFinance = new YahooFinance();

    // Try quoteSummary first
    try {
      const result = await yahooFinance.quoteSummary(symbol, {
        modules: ["recommendationTrend"],
      });

      const newsData = (result as Record<string, unknown>).news || [];

      if (Array.isArray(newsData) && newsData.length > 0) {
        return newsData.map((item: Record<string, unknown>) => ({
          title: (item.title as string) || (item.headline as string) || "",
          description: (item.summary as string) || (item.description as string) || (item.title as string) || "",
          content: (item.content as string) || (item.summary as string) || "",
          publishedAt: item.providerPublishTime
            ? new Date((item.providerPublishTime as number) * 1000)
            : new Date(),
          source: (item.publisher as string) || "Yahoo Finance",
          url: (item.link as string) || (item.url as string) || "",
          quality: assessArticleQuality(
            (item.title as string) || "",
            (item.summary as string) || (item.description as string) || ""
          ),
        }));
      }
    } catch {
      console.log("Yahoo quoteSummary failed, trying search...");
    }

    // Fallback to search
    const searchResult = await yahooFinance.search(symbol);
    if (searchResult.news && searchResult.news.length > 0) {
      return searchResult.news.slice(0, 15).map((item: Record<string, unknown>) => ({
        title: (item.title as string) || "",
        description: (item.summary as string) || (item.description as string) || "",
        content: (item.content as string) || (item.summary as string) || "",
        publishedAt: new Date((item.providerPublishTime as number) || Date.now()),
        source: (item.publisher as string) || "Yahoo Finance",
        url: (item.link as string) || "",
        quality: assessArticleQuality((item.title as string) || "", (item.summary as string) || ""),
      }));
    }

    return [];
  } catch (error) {
    console.error("Yahoo Finance fetch error:", error);
    return [];
  }
}

/**
 * Finnhub News (Free Tier - Secondary Source)
 * Note: Requires API key but has free tier
 */
async function fetchFinnhubNews(symbol: string): Promise<NewsArticle[]> {
  try {
    // Check if FINNHUB_API_KEY is available
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      console.log("Finnhub API key not configured, skipping...");
      return [];
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7); // Last 7 days

    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate.toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&token=${apiKey}`
    );

    if (!response.ok) {
      console.log("Finnhub API failed:", response.status);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.slice(0, 20).map((item: Record<string, unknown>) => ({
      title: (item.headline as string) || "",
      description: (item.summary as string) || (item.headline as string) || "",
      content: (item.summary as string) || "",
      publishedAt: new Date((item.datetime as number) * 1000),
      source: (item.source as string) || "Finnhub",
      url: (item.url as string) || "",
      quality: assessArticleQuality((item.headline as string) || "", (item.summary as string) || ""),
    }));
  } catch (error) {
    console.error("Finnhub fetch error:", error);
    return [];
  }
}

/**
 * MarketAux News (Free Tier - Tertiary Source)
 */
async function fetchMarketAuxNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const apiKey = process.env.MARKETAUX_API_KEY;
    if (!apiKey) {
      console.log("MarketAux API key not configured, skipping...");
      return [];
    }

    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&language=en&api_token=${apiKey}`
    );

    if (!response.ok) {
      console.log("MarketAux API failed:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.slice(0, 20).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      description: (item.description as string) || (item.snippet as string) || (item.title as string) || "",
      content: (item.description as string) || (item.snippet as string) || "",
      publishedAt: new Date(item.published_at as string),
      source: (item.source as string) || "MarketAux",
      url: (item.url as string) || "",
      quality: assessArticleQuality((item.title as string) || "", (item.description as string) || (item.snippet as string) || ""),
    }));
  } catch (error) {
    console.error("MarketAux fetch error:", error);
    return [];
  }
}

/**
 * Alpha Vantage News (Free Tier)
 */
async function fetchAlphaVantageNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.log("Alpha Vantage API key not configured, skipping...");
      return [];
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}`
    );

    if (!response.ok) {
      console.log("Alpha Vantage API failed:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.feed || data.feed.length === 0) {
      return [];
    }

    return data.feed.slice(0, 20).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      description: (item.summary as string) || (item.title as string) || "",
      content: (item.summary as string) || "",
      publishedAt: new Date(item.time_published as string),
      source: (item.source as string) || "Alpha Vantage",
      url: (item.url as string) || "",
      quality: assessArticleQuality((item.title as string) || "", (item.summary as string) || ""),
    }));
  } catch (error) {
    console.error("Alpha Vantage fetch error:", error);
    return [];
  }
}

// ============================================================================
// QUALITY ASSESSMENT
// ============================================================================

/**
 * Assess article quality based on content length and informativeness
 */
function assessArticleQuality(title: string, description: string): "high" | "medium" | "low" {
  const totalLength = title.length + description.length;
  const hasNumbers = /\d+/.test(title + description);
  const hasFinancialTerms = /(revenue|earnings|profit|loss|growth|decline|stock|shares|market|price|analyst)/i.test(
    title + description
  );

  // High quality: Long content with numbers and financial terms
  if (totalLength > 200 && hasNumbers && hasFinancialTerms) {
    return "high";
  }

  // Medium quality: Decent length or has key financial info
  if (totalLength > 100 || (hasNumbers && hasFinancialTerms)) {
    return "medium";
  }

  // Low quality: Short, generic, or vague
  return "low";
}

/**
 * Check if articles meet minimum quality standards
 */
function meetsQualityThreshold(articles: NewsArticle[]): boolean {
  if (articles.length === 0) return false;

  // Need at least 3 articles
  if (articles.length < 3) return false;

  // At least 2 articles must be medium or high quality
  const qualityArticles = articles.filter(
    (a) => a.quality === "high" || a.quality === "medium"
  );

  return qualityArticles.length >= 2;
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

/**
 * Remove duplicate articles based on title similarity
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const unique: NewsArticle[] = [];
  const seenTitles = new Set<string>();

  for (const article of articles) {
    const normalized = article.title.toLowerCase().replace(/[^\w\s]/g, "").trim();

    // Check for exact duplicates
    if (seenTitles.has(normalized)) {
      continue;
    }

    // Check for similar titles
    let isDuplicate = false;
    for (const seenTitle of seenTitles) {
      const similarity = calculateSimilarity(normalized, seenTitle);
      if (similarity > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(article);
      seenTitles.add(normalized);
    }
  }

  return unique;
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// ============================================================================
// MAIN FETCHER WITH FALLBACKS
// ============================================================================

/**
 * Fetch news from multiple sources with intelligent fallbacks and ticker-specific filtering
 */
export async function fetchStockNewsMultiSource(
  symbol: string,
  options: {
    minRelevanceScore?: number;
    enableRelevanceFiltering?: boolean;
    logFiltering?: boolean;
    retryWithBroaderParams?: boolean;
  } = {}
): Promise<{
  articles: NewsArticle[];
  sources: string[];
  quality: "high" | "medium" | "low" | "insufficient";
  relevanceStats?: {
    totalFetched: number;
    relevantArticles: number;
    irrelevantFiltered: number;
    relevanceRate: number;
  };
}> {
  const {
    minRelevanceScore = 0.3,
    enableRelevanceFiltering = true,
    logFiltering = true,
    retryWithBroaderParams = true,
  } = options;

  // Get ticker information for relevance filtering
  let tickerInfo: TickerInfo | null = null;
  if (enableRelevanceFiltering) {
    try {
      tickerInfo = await getTickerInfo(symbol);
      console.log(`Ticker info: ${tickerInfo.name} (${tickerInfo.symbol})`);
      console.log(`Aliases: ${tickerInfo.aliases.slice(0, 5).join(", ")}${tickerInfo.aliases.length > 5 ? "..." : ""}`);
    } catch (error) {
      console.error("Failed to get ticker info, proceeding without relevance filtering:", error);
    }
  }

  const sources: NewsSource[] = [
    { name: "Yahoo Finance", fetcher: fetchYahooFinanceNews, priority: 1 },
    { name: "Finnhub", fetcher: fetchFinnhubNews, priority: 2 },
    { name: "MarketAux", fetcher: fetchMarketAuxNews, priority: 3 },
    { name: "Alpha Vantage", fetcher: fetchAlphaVantageNews, priority: 4 },
  ];

  const allArticles: NewsArticle[] = [];
  const successfulSources: string[] = [];

  // Try each source in priority order
  for (const source of sources) {
    console.log(`Fetching from ${source.name}...`);

    try {
      const articles = await source.fetcher(symbol);

      if (articles.length > 0) {
        console.log(`${source.name}: Found ${articles.length} articles`);
        allArticles.push(...articles);
        successfulSources.push(source.name);

        // If we have enough quality articles from primary source, we can stop
        if (source.priority === 1 && meetsQualityThreshold(articles)) {
          console.log(`Primary source (${source.name}) provided sufficient quality`);
          break;
        }
      }
    } catch (error) {
      console.error(`${source.name} failed:`, error);
    }

    // Stop if we have enough high-quality articles
    if (allArticles.length >= 10 && meetsQualityThreshold(allArticles)) {
      console.log(`Collected ${allArticles.length} articles, stopping fetch`);
      break;
    }
  }

  // Deduplicate
  let uniqueArticles = deduplicateArticles(allArticles);
  console.log(`After deduplication: ${uniqueArticles.length} unique articles`);

  // Apply ticker-specific relevance filtering
  let relevanceStats: {
    totalFetched: number;
    relevantArticles: number;
    irrelevantFiltered: number;
    relevanceRate: number;
  } | undefined;

  if (enableRelevanceFiltering && tickerInfo) {
    const totalBefore = uniqueArticles.length;

    if (logFiltering) {
      logRelevanceFiltering(uniqueArticles, tickerInfo, minRelevanceScore);
    }

    const { relevant, irrelevant } = filterRelevantArticles(
      uniqueArticles,
      tickerInfo,
      minRelevanceScore
    );

    relevanceStats = {
      totalFetched: totalBefore,
      relevantArticles: relevant.length,
      irrelevantFiltered: irrelevant.length,
      relevanceRate: totalBefore > 0 ? relevant.length / totalBefore : 0,
    };

    console.log(`Relevance filtering: ${relevant.length} relevant, ${irrelevant.length} filtered out`);

    // If insufficient relevant articles and retry is enabled, try broader search
    if (relevant.length < 3 && retryWithBroaderParams && minRelevanceScore > 0.2) {
      console.log(`Insufficient relevant articles (${relevant.length}), retrying with lower relevance threshold...`);

      // Retry with lower threshold
      const retryResult = await fetchStockNewsMultiSource(symbol, {
        minRelevanceScore: Math.max(0.2, minRelevanceScore - 0.1),
        enableRelevanceFiltering: true,
        logFiltering: false,
        retryWithBroaderParams: false, // Prevent infinite recursion
      });

      // If retry found more relevant articles, use those
      if (retryResult.articles.length > relevant.length) {
        console.log(`Retry found ${retryResult.articles.length} articles (better than ${relevant.length})`);
        return retryResult;
      }
    }

    uniqueArticles = relevant;
  }

  // Sort by quality and recency
  uniqueArticles.sort((a, b) => {
    const qualityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const qualityDiff = qualityWeight[b.quality || 'low'] - qualityWeight[a.quality || 'low'];

    if (qualityDiff !== 0) return qualityDiff;

    // Handle both Date and string types for publishedAt
    const aTime = typeof a.publishedAt === 'string' ? new Date(a.publishedAt).getTime() : a.publishedAt.getTime();
    const bTime = typeof b.publishedAt === 'string' ? new Date(b.publishedAt).getTime() : b.publishedAt.getTime();

    return bTime - aTime;
  });

  // Determine overall quality
  let overallQuality: "high" | "medium" | "low" | "insufficient";

  if (uniqueArticles.length === 0) {
    overallQuality = "insufficient";
  } else if (meetsQualityThreshold(uniqueArticles)) {
    const highQualityCount = uniqueArticles.filter((a) => a.quality === "high").length;
    overallQuality = highQualityCount >= 3 ? "high" : "medium";
  } else {
    overallQuality = "low";
  }

  console.log(`Final: ${uniqueArticles.length} unique relevant articles, quality: ${overallQuality}`);
  console.log(`Sources used: ${successfulSources.join(", ")}`);

  return {
    articles: uniqueArticles.slice(0, 20), // Limit to top 20
    sources: successfulSources,
    quality: overallQuality,
    relevanceStats,
  };
}
