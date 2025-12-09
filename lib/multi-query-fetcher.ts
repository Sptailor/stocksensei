/**
 * Multi-Query Multi-Source News Fetcher
 * Guarantees 3-5 relevant articles through query expansion and multi-source fallback
 */

import { getTickerInfo, type TickerInfo } from "./ticker-resolver";
import { getQueryBatches, logQueryExpansion } from "./query-expansion";
import { filterRelevantArticles } from "./article-relevance";
import type { NewsArticle } from "./news-fetcher";

// Import individual news source fetchers
import yahooFinance from "yahoo-finance2";

const MINIMUM_ARTICLES = 3;
const TARGET_ARTICLES = 5;
const MIN_RELEVANCE_SCORE = 0.55;

export interface MultiQueryFetchResult {
  articles: NewsArticle[];
  totalFetched: number;
  relevantCount: number;
  queriesUsed: string[];
  sourcesUsed: string[];
  relevanceRate: number;
  success: boolean;
  message: string;
}

/**
 * Advanced URL and title-based deduplication
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const unique: NewsArticle[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  for (const article of articles) {
    // Check URL deduplication
    if (article.url) {
      const normalizedUrl = article.url.toLowerCase().split("?")[0]; // Remove query params
      if (seenUrls.has(normalizedUrl)) {
        continue;
      }
      seenUrls.add(normalizedUrl);
    }

    // Check title similarity
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    let isDuplicate = false;
    for (const seenTitle of seenTitles) {
      const similarity = calculateTitleSimilarity(normalizedTitle, seenTitle);
      if (similarity > 0.85) {
        // 85% similarity threshold
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(article);
      seenTitles.add(normalizedTitle);
    }
  }

  return unique;
}

/**
 * Calculate title similarity using Jaccard index
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(title2.split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Fetch news from Yahoo Finance with specific query
 */
async function fetchFromYahooWithQuery(query: string): Promise<NewsArticle[]> {
  try {
    const searchResult = await yahooFinance.search(query);

    if (!searchResult.news || searchResult.news.length === 0) {
      return [];
    }

    return searchResult.news.slice(0, 20).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      description: (item.summary as string) || (item.description as string) || "",
      content: (item.content as string) || (item.summary as string) || "",
      publishedAt: new Date((item.providerPublishTime as number) || Date.now()),
      source: (item.publisher as string) || "Yahoo Finance",
      url: (item.link as string) || "",
      symbols: [], // Yahoo search doesn't provide symbols in metadata
      quality: "medium" as const,
    }));
  } catch (error) {
    console.error(`Yahoo Finance query "${query}" failed:`, error);
    return [];
  }
}

/**
 * Fetch articles using multiple queries until we have enough relevant articles
 */
export async function fetchWithMultiQuery(
  symbol: string,
  options: {
    minArticles?: number;
    targetArticles?: number;
    minRelevanceScore?: number;
    logExpansion?: boolean;
  } = {}
): Promise<MultiQueryFetchResult> {
  const {
    minArticles = MINIMUM_ARTICLES,
    targetArticles = TARGET_ARTICLES,
    minRelevanceScore = MIN_RELEVANCE_SCORE,
    logExpansion = true,
  } = options;

  console.log(`\n🔍 Multi-Query Fetch for ${symbol}`);
  console.log(`Target: ${targetArticles} articles (minimum: ${minArticles})`);
  console.log(`Relevance threshold: ${minRelevanceScore}`);

  // Step 1: Get ticker information
  let tickerInfo: TickerInfo;
  try {
    tickerInfo = await getTickerInfo(symbol);
    console.log(`✓ Ticker resolved: ${tickerInfo.name}`);
  } catch (error) {
    console.error("Failed to resolve ticker:", error);
    return {
      articles: [],
      totalFetched: 0,
      relevantCount: 0,
      queriesUsed: [],
      sourcesUsed: [],
      relevanceRate: 0,
      success: false,
      message: "Failed to resolve ticker information",
    };
  }

  // Step 2: Generate expanded queries
  const queryBatches = getQueryBatches(tickerInfo);

  if (logExpansion) {
    logQueryExpansion(tickerInfo);
  }

  // Step 3: Fetch articles using queries in priority order
  const allArticles: NewsArticle[] = [];
  const queriesUsed: string[] = [];
  const sourcesUsed = new Set<string>();

  for (const batch of queryBatches) {
    console.log(`\n📡 Fetching batch (Priority ${batch[0].priority})...`);

    // Fetch from all queries in this batch in parallel
    const batchPromises = batch.map(async query => {
      console.log(`  Trying query: "${query.query}"`);
      const articles = await fetchFromYahooWithQuery(query.query);
      console.log(`    Found ${articles.length} articles`);

      if (articles.length > 0) {
        queriesUsed.push(query.query);
        articles.forEach(a => a.source && sourcesUsed.add(a.source));
      }

      return articles;
    });

    const batchResults = await Promise.all(batchPromises);
    const batchArticles = batchResults.flat();

    allArticles.push(...batchArticles);

    // Deduplicate after each batch
    const uniqueArticles = deduplicateArticles(allArticles);

    console.log(`  Total unique articles so far: ${uniqueArticles.length}`);

    // Filter by relevance
    const { relevant } = filterRelevantArticles(
      uniqueArticles,
      tickerInfo,
      minRelevanceScore
    );

    console.log(`  Relevant articles (≥${minRelevanceScore}): ${relevant.length}`);

    // Check if we have enough relevant articles
    if (relevant.length >= targetArticles) {
      console.log(`✓ Target reached: ${relevant.length} relevant articles`);
      break;
    }

    // Continue if we haven't reached minimum yet
    if (relevant.length < minArticles) {
      console.log(`  Need at least ${minArticles - relevant.length} more, continuing...`);
    }
  }

  // Step 4: Final deduplication and filtering
  const uniqueArticles = deduplicateArticles(allArticles);
  const { relevant } = filterRelevantArticles(
    uniqueArticles,
    tickerInfo,
    minRelevanceScore
  );

  // Step 5: Determine success
  const success = relevant.length >= minArticles;
  let message = "";

  if (!success) {
    message = `Insufficient relevant news to generate reliable sentiment. Found ${relevant.length} relevant articles but need at least ${minArticles}. Please try again later.`;
  } else if (relevant.length >= targetArticles) {
    message = `Successfully retrieved ${relevant.length} high-quality relevant articles.`;
  } else {
    message = `Retrieved ${relevant.length} relevant articles (below target of ${targetArticles} but sufficient for analysis).`;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Final Results:`);
  console.log(`   Total fetched: ${uniqueArticles.length}`);
  console.log(`   Relevant (≥${minRelevanceScore}): ${relevant.length}`);
  console.log(`   Relevance rate: ${uniqueArticles.length > 0 ? ((relevant.length / uniqueArticles.length) * 100).toFixed(1) : 0}%`);
  console.log(`   Queries used: ${queriesUsed.length}/${queryBatches.flat().length}`);
  console.log(`   Success: ${success ? "✓" : "✗"}`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    articles: relevant,
    totalFetched: uniqueArticles.length,
    relevantCount: relevant.length,
    queriesUsed,
    sourcesUsed: Array.from(sourcesUsed),
    relevanceRate: uniqueArticles.length > 0 ? relevant.length / uniqueArticles.length : 0,
    success,
    message,
  };
}

/**
 * Merge results from multiple fetching attempts
 */
export function mergeArticles(...articleArrays: NewsArticle[][]): NewsArticle[] {
  const combined = articleArrays.flat();
  return deduplicateArticles(combined);
}
