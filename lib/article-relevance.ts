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
 * Check if an article is relevant to the ticker
 */
export function isArticleRelevant(
  article: NewsArticle,
  tickerInfo: TickerInfo,
  minRelevanceScore: number = 0.3
): RelevanceScore {
  const text = `${article.title} ${article.description || ""} ${article.content || ""}`.toLowerCase();
  const matchedTerms: string[] = [];
  let highestScore = 0;
  let matchType: RelevanceScore["matchType"] = "none";

  // 1. Check if ticker symbol appears in metadata
  if (article.symbols && article.symbols.length > 0) {
    const symbolMatch = article.symbols.some(
      s => s.toUpperCase() === tickerInfo.symbol.toUpperCase()
    );
    if (symbolMatch) {
      matchedTerms.push(tickerInfo.symbol);
      highestScore = 1.0;
      matchType = "metadata";
    }
  }

  // 2. Check for exact ticker symbol in text
  const symbolRegex = new RegExp(`\\b${escapeRegex(tickerInfo.symbol)}\\b`, "i");
  if (symbolRegex.test(text)) {
    matchedTerms.push(tickerInfo.symbol);
    highestScore = Math.max(highestScore, 0.9);
    if (matchType === "none") matchType = "symbol";
  }

  // Also check with $ prefix (common in financial news)
  const dollarSymbolRegex = new RegExp(`\\$${escapeRegex(tickerInfo.symbol)}\\b`, "i");
  if (dollarSymbolRegex.test(text)) {
    matchedTerms.push(`$${tickerInfo.symbol}`);
    highestScore = Math.max(highestScore, 0.95);
    if (matchType === "none") matchType = "symbol";
  }

  // 3. Check for company name variations
  for (const alias of tickerInfo.aliases) {
    // Skip very short aliases (< 3 chars) unless it's the ticker itself
    if (alias.length < 3 && alias !== tickerInfo.symbol) continue;

    const aliasRegex = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
    if (aliasRegex.test(text)) {
      matchedTerms.push(alias);

      // Full company name gets higher score than aliases
      if (alias === tickerInfo.longName || alias === tickerInfo.name) {
        highestScore = Math.max(highestScore, 0.85);
        if (matchType === "none" || matchType === "alias") matchType = "company_name";
      } else {
        highestScore = Math.max(highestScore, 0.7);
        if (matchType === "none") matchType = "alias";
      }
    }
  }

  // 4. Relevance score calculation
  // Boost score if matches appear in title (more important than description)
  const titleLower = article.title.toLowerCase();
  let titleBoost = 0;

  if (symbolRegex.test(titleLower) || dollarSymbolRegex.test(titleLower)) {
    titleBoost = 0.2;
  } else {
    for (const alias of tickerInfo.aliases) {
      if (alias.length < 3 && alias !== tickerInfo.symbol) continue;
      const aliasRegex = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
      if (aliasRegex.test(titleLower)) {
        titleBoost = 0.15;
        break;
      }
    }
  }

  const finalScore = Math.min(1.0, highestScore + titleBoost);

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
  minRelevanceScore: number = 0.3
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
