/**
 * Article Relevance Filtering
 * Filters news articles to ensure they are relevant to the specific ticker
 */

import { type TickerInfo } from "./ticker-resolver";

export interface NewsArticle {
  title: string;
  description?: string;
  content?: string;
  publishedAt: Date | string;
  source?: string;
  url?: string;
  symbols?: string[]; // Symbols mentioned in article metadata (if available)
  quality?: "high" | "medium" | "low";
}

export interface RelevanceScore {
  isRelevant: boolean;
  score: number; // 0 to 1, where 1 is highly relevant
  matchedTerms: string[];
  matchType: "symbol" | "company_name" | "alias" | "metadata" | "none";
}

/**
 * Trusted news domains for financial reporting
 */
const TRUSTED_FINANCIAL_DOMAINS = [
  "wsj.com",
  "bloomberg.com",
  "reuters.com",
  "ft.com",
  "marketwatch.com",
  "cnbc.com",
  "seekingalpha.com",
  "benzinga.com",
  "fool.com",
  "barrons.com",
  "finance.yahoo.com",
  "investing.com",
  "financialtimes.com",
  "businessinsider.com",
  // Cryptocurrency news sources
  "coindesk.com",
  "cointelegraph.com",
  "decrypt.co",
  "theblock.co",
  "cryptonews.com",
  "cryptoslate.com",
  "bitcoinmagazine.com",
  "ambcrypto.com",
  "u.today",
  "newsbtc.com",
];

/**
 * Extract domain from URL
 */
function getDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Check if domain is trusted for financial news
 */
function isTrustedDomain(url?: string): boolean {
  if (!url) return false;
  const domain = getDomain(url);
  if (!domain) return false;

  return TRUSTED_FINANCIAL_DOMAINS.some(trusted => domain.includes(trusted));
}

/**
 * Enhanced relevance scoring with domain credibility
 * Score range: 0.0 to 1.0 (minimum 0.55 recommended)
 */
export function isArticleRelevant(
  article: NewsArticle,
  tickerInfo: TickerInfo,
  minRelevanceScore: number = 0.55
): RelevanceScore {
  const titleLower = article.title.toLowerCase();
  const descriptionLower = (article.description || "").toLowerCase();

  const matchedTerms: string[] = [];
  let score = 0;
  let matchType: RelevanceScore["matchType"] = "none";

  // 1. Title contains ticker symbol: +0.6
  const symbolRegex = new RegExp(`\\b${escapeRegex(tickerInfo.symbol)}\\b`, "i");
  const dollarSymbolRegex = new RegExp(`\\$${escapeRegex(tickerInfo.symbol)}\\b`, "i");

  if (symbolRegex.test(titleLower) || dollarSymbolRegex.test(titleLower)) {
    score += 0.6;
    matchedTerms.push(tickerInfo.symbol);
    matchType = "symbol";
  }

  // 2. Title contains company name: +0.5
  const companyNameInTitle = tickerInfo.aliases.some(alias => {
    if (alias.length < 3 && alias !== tickerInfo.symbol) return false;
    const aliasRegex = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
    if (aliasRegex.test(titleLower)) {
      matchedTerms.push(alias);
      return true;
    }
    return false;
  });

  if (companyNameInTitle && score < 0.5) {
    score += 0.5;
    if (matchType === "none") matchType = "company_name";
  }

  // 3. Summary/Description contains ticker: +0.3
  if (symbolRegex.test(descriptionLower) || dollarSymbolRegex.test(descriptionLower)) {
    score += 0.3;
    if (!matchedTerms.includes(tickerInfo.symbol)) {
      matchedTerms.push(tickerInfo.symbol);
    }
    if (matchType === "none") matchType = "symbol";
  }

  // 4. Summary contains company name or keywords: +0.2
  const keywordsInDescription = tickerInfo.aliases.some(alias => {
    if (alias.length < 3 && alias !== tickerInfo.symbol) return false;
    const aliasRegex = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
    if (aliasRegex.test(descriptionLower)) {
      if (!matchedTerms.includes(alias)) {
        matchedTerms.push(alias);
      }
      return true;
    }
    return false;
  });

  if (keywordsInDescription) {
    score += 0.2;
    if (matchType === "none") matchType = "alias";
  }

  // 5. Check if ticker symbol appears in metadata: +0.4
  if (article.symbols && article.symbols.length > 0) {
    const symbolMatch = article.symbols.some(
      s => s.toUpperCase() === tickerInfo.symbol.toUpperCase()
    );
    if (symbolMatch) {
      score += 0.4;
      if (!matchedTerms.includes(tickerInfo.symbol)) {
        matchedTerms.push(tickerInfo.symbol);
      }
      if (matchType === "none") matchType = "metadata";
    }
  }

  // 6. URL domain is trusted financial source: +0.2
  if (isTrustedDomain(article.url)) {
    score += 0.2;
  }

  // Cap score at 1.0
  const finalScore = Math.min(1.0, score);

  return {
    isRelevant: finalScore >= minRelevanceScore,
    score: finalScore,
    matchedTerms: [...new Set(matchedTerms)],
    matchType,
  };
}

/**
 * Filter articles to only include those relevant to the ticker
 */
export function filterRelevantArticles(
  articles: NewsArticle[],
  tickerInfo: TickerInfo,
  minRelevanceScore: number = 0.55
): {
  relevant: NewsArticle[];
  irrelevant: NewsArticle[];
  relevanceScores: Map<NewsArticle, RelevanceScore>;
} {
  const relevant: NewsArticle[] = [];
  const irrelevant: NewsArticle[] = [];
  const relevanceScores = new Map<NewsArticle, RelevanceScore>();

  for (const article of articles) {
    const relevance = isArticleRelevant(article, tickerInfo, minRelevanceScore);
    relevanceScores.set(article, relevance);

    if (relevance.isRelevant) {
      relevant.push(article);
    } else {
      irrelevant.push(article);
    }
  }

  // Sort relevant articles by relevance score (highest first)
  relevant.sort((a, b) => {
    const scoreA = relevanceScores.get(a)?.score || 0;
    const scoreB = relevanceScores.get(b)?.score || 0;
    return scoreB - scoreA;
  });

  return { relevant, irrelevant, relevanceScores };
}

/**
 * Get statistics about article relevance
 */
export function getRelevanceStats(
  articles: NewsArticle[],
  tickerInfo: TickerInfo
): {
  total: number;
  relevant: number;
  irrelevant: number;
  relevanceRate: number;
  averageRelevanceScore: number;
  highRelevance: number; // score >= 0.7
  mediumRelevance: number; // score >= 0.5
  lowRelevance: number; // score >= 0.3
} {
  const { relevant, relevanceScores } = filterRelevantArticles(articles, tickerInfo);

  let totalScore = 0;
  let highRelevance = 0;
  let mediumRelevance = 0;
  let lowRelevance = 0;

  for (const article of relevant) {
    const score = relevanceScores.get(article)?.score || 0;
    totalScore += score;

    if (score >= 0.7) highRelevance++;
    else if (score >= 0.5) mediumRelevance++;
    else if (score >= 0.3) lowRelevance++;
  }

  return {
    total: articles.length,
    relevant: relevant.length,
    irrelevant: articles.length - relevant.length,
    relevanceRate: articles.length > 0 ? relevant.length / articles.length : 0,
    averageRelevanceScore: relevant.length > 0 ? totalScore / relevant.length : 0,
    highRelevance,
    mediumRelevance,
    lowRelevance,
  };
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Log relevance filtering results (for debugging)
 */
export function logRelevanceFiltering(
  articles: NewsArticle[],
  tickerInfo: TickerInfo,
  minRelevanceScore: number = 0.3
): void {
  console.log(`\n=== Relevance Filtering for ${tickerInfo.symbol} ===`);
  console.log(`Company: ${tickerInfo.name}`);
  console.log(`Aliases: ${tickerInfo.aliases.join(", ")}`);
  console.log(`Total articles: ${articles.length}`);

  const { relevant, irrelevant, relevanceScores } = filterRelevantArticles(
    articles,
    tickerInfo,
    minRelevanceScore
  );

  console.log(`\nRelevant articles: ${relevant.length}`);
  relevant.forEach((article, idx) => {
    const score = relevanceScores.get(article);
    console.log(
      `  ${idx + 1}. [${score?.score.toFixed(2)}] ${score?.matchType} - "${article.title.substring(0, 80)}..."`
    );
    console.log(`     Matched: ${score?.matchedTerms.join(", ")}`);
  });

  console.log(`\nIrrelevant articles (filtered out): ${irrelevant.length}`);
  if (irrelevant.length > 0 && irrelevant.length <= 5) {
    irrelevant.forEach((article, idx) => {
      const score = relevanceScores.get(article);
      console.log(
        `  ${idx + 1}. [${score?.score.toFixed(2)}] "${article.title.substring(0, 80)}..."`
      );
    });
  }

  const stats = getRelevanceStats(articles, tickerInfo);
  console.log(`\nStats:`);
  console.log(`  Relevance rate: ${(stats.relevanceRate * 100).toFixed(1)}%`);
  console.log(`  Average relevance: ${stats.averageRelevanceScore.toFixed(2)}`);
  console.log(`  High relevance: ${stats.highRelevance}`);
  console.log(`  Medium relevance: ${stats.mediumRelevance}`);
  console.log(`  Low relevance: ${stats.lowRelevance}`);
  console.log("=".repeat(50) + "\n");
}
