import Sentiment from "sentiment";
import Anthropic from "@anthropic-ai/sdk";

const sentiment = new Sentiment();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// TYPES
// ============================================================================

export interface NewsArticle {
  title: string;
  description?: string;
  publishedAt: Date | string;
  source?: string;
  url?: string;
}

export interface SentimentIndicators {
  positive: string[];
  negative: string[];
}

export interface ArticleSentimentBreakdown {
  title: string;
  source: string;
  publishedAt: Date | string;
  sentiment: "positive" | "negative" | "neutral";
  score: number; // -1 to 1
  weight: number;
  positiveTerms: string[];
  negativeTerms: string[];
  hasNumericalData: boolean;
  impactCategory: string;
}

export interface DetailedSentimentResult {
  sentimentScore: number; // -1 to 1
  sentimentLabel: "Extremely Negative" | "Negative" | "Slightly Negative" | "Neutral" | "Slightly Positive" | "Positive" | "Extremely Positive" | "Insufficient Data";
  analysis: string;
  positiveIndicators: string[];
  negativeIndicators: string[];
  confidence: number; // 0 to 1
  articlesAnalyzed: number;
  articleBreakdown?: ArticleSentimentBreakdown[];
  dataQuality: "high" | "medium" | "low" | "insufficient";
}

interface WeightedArticle {
  article: NewsArticle;
  recencyWeight: number;
  specificityWeight: number;
  impactWeight: number;
  totalWeight: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Keywords for impact detection (high-impact events)
const HIGH_IMPACT_KEYWORDS = {
  earnings: /\b(earnings|revenue|profit|loss|eps|quarterly|annual report)\b/i,
  product: /\b(launch|unveil|release|announce|product|new model)\b/i,
  regulatory: /\b(fda|sec|investigation|lawsuit|recall|ban|approved|denied)\b/i,
  sales: /\b(sales|delivery|shipment|order|demand)\b/i,
  leadership: /\b(ceo|cfo|executive|resignation|appointed|hired)\b/i,
  analyst: /\b(upgrade|downgrade|rating|price target|analyst)\b/i,
  market: /\b(ipo|merger|acquisition|buyback|dividend)\b/i,
  innovation: /\b(ai|robot|autonomous|breakthrough|patent|technology)\b/i,
};

// Positive and negative financial terms
const POSITIVE_TERMS = [
  "surge", "soar", "rally", "gain", "profit", "beat", "exceed", "outperform",
  "growth", "expansion", "success", "breakthrough", "innovation", "approved",
  "upgrade", "bullish", "optimistic", "strong", "revenue growth", "record",
  "milestone", "partnership", "acquisition", "investment"
];

const NEGATIVE_TERMS = [
  "plunge", "crash", "fall", "decline", "loss", "miss", "underperform",
  "lawsuit", "investigation", "recall", "warning", "downgrade", "bearish",
  "pessimistic", "weak", "layoff", "bankruptcy", "fraud", "scandal",
  "delay", "cancellation", "shortage", "deficit"
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate recency weight (newer = higher weight)
 * Uses exponential decay: articles older than 7 days have reduced weight
 */
function calculateRecencyWeight(publishedAt: Date | string): number {
  const now = new Date();
  const published = new Date(publishedAt);
  const ageInHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  // Exponential decay: 100% at 0 hours, 50% at 24 hours, 25% at 48 hours, etc.
  const weight = Math.exp(-ageInHours / 24);

  // Minimum weight of 0.1 for very old articles
  return Math.max(0.1, Math.min(1.0, weight));
}

/**
 * Calculate specificity weight (numerical data = higher weight)
 */
function calculateSpecificityWeight(text: string): number {
  let weight = 0.5; // Base weight

  // Check for numerical data (percentages, dollar amounts, specific numbers)
  const hasPercentage = /\d+(\.\d+)?%/.test(text);
  const hasDollarAmount = /\$\d+(\.\d+)?[BMK]?/.test(text);
  const hasNumbers = /\d+/.test(text);

  if (hasPercentage) weight += 0.2;
  if (hasDollarAmount) weight += 0.2;
  if (hasNumbers) weight += 0.1;

  return Math.min(1.0, weight);
}

/**
 * Calculate impact weight based on topic importance
 */
function calculateImpactWeight(text: string): { weight: number; category: string } {
  let weight = 0.3; // Base weight for generic news
  let category = "general";

  // Check for high-impact categories
  for (const [cat, regex] of Object.entries(HIGH_IMPACT_KEYWORDS)) {
    if (regex.test(text)) {
      // Earnings and regulatory news have highest impact
      if (cat === "earnings" || cat === "regulatory") {
        if (weight < 1.0) {
          weight = 1.0;
          category = cat;
        }
      } else if (cat === "analyst" || cat === "product") {
        if (weight < 0.8) {
          weight = 0.8;
          category = cat;
        }
      } else {
        if (weight < 0.6) {
          weight = 0.6;
          category = cat;
        }
      }
    }
  }

  return { weight, category };
}

/**
 * Analyze single article for sentiment
 */
function analyzeArticleSentiment(article: NewsArticle): {
  score: number;
  positive: string[];
  negative: string[];
} {
  const text = `${article.title} ${article.description || ""}`;

  // Use sentiment library for base analysis
  const baseResult = sentiment.analyze(text);

  // Enhance with custom financial term detection
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];

  for (const term of POSITIVE_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(text)) {
      foundPositive.push(term);
    }
  }

  for (const term of NEGATIVE_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(text)) {
      foundNegative.push(term);
    }
  }

  // Combine library sentiment with custom terms
  const customScore = (foundPositive.length - foundNegative.length) * 2;
  let combinedScore = (baseResult.score + customScore) / 10; // Normalize

  // Clamp to -1..1
  combinedScore = Math.max(-1, Math.min(1, combinedScore));

  return {
    score: combinedScore,
    positive: [...new Set([...baseResult.positive, ...foundPositive])],
    negative: [...new Set([...baseResult.negative, ...foundNegative])],
  };
}

/**
 * Deduplicate articles by title similarity
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const unique: NewsArticle[] = [];
  const seen = new Set<string>();

  for (const article of articles) {
    // Normalize title for comparison
    const normalized = article.title.toLowerCase().replace(/[^\w\s]/g, "").trim();

    // Check if we've seen a very similar title
    let isDuplicate = false;
    for (const seenTitle of seen) {
      const similarity = calculateSimilarity(normalized, seenTitle);
      if (similarity > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(article);
      seen.add(normalized);
    }
  }

  return unique;
}

/**
 * Simple string similarity (Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Convert score to label
 */
function scoreToLabel(score: number, dataQuality?: string): DetailedSentimentResult["sentimentLabel"] {
  if (dataQuality === "insufficient") return "Insufficient Data";
  if (score <= -0.7) return "Extremely Negative";
  if (score <= -0.3) return "Negative";
  if (score <= -0.1) return "Slightly Negative";
  if (score >= 0.7) return "Extremely Positive";
  if (score >= 0.3) return "Positive";
  if (score >= 0.1) return "Slightly Positive";
  return "Neutral";
}

/**
 * Determine data quality based on article count and content
 */
function assessDataQuality(articles: NewsArticle[]): "high" | "medium" | "low" | "insufficient" {
  if (articles.length === 0) return "insufficient";
  if (articles.length < 3) return "insufficient";

  // Check content quality
  let substantiveArticles = 0;
  for (const article of articles) {
    const text = `${article.title} ${article.description || ""}`;
    const hasNumbers = /\d+/.test(text);
    const hasFinancialTerms = /(revenue|earnings|profit|loss|growth|decline|stock|shares|market|price|analyst)/i.test(text);
    const hasSubstantialContent = text.length > 100;

    if ((hasNumbers && hasFinancialTerms) || hasSubstantialContent) {
      substantiveArticles++;
    }
  }

  const qualityRatio = substantiveArticles / articles.length;

  if (articles.length >= 10 && qualityRatio >= 0.5) return "high";
  if (articles.length >= 5 && qualityRatio >= 0.3) return "medium";
  if (substantiveArticles >= 2) return "medium";

  return "low";
}

/**
 * Calculate sentiment consistency across articles
 * Returns a value between 0.5 (completely mixed) and 1.0 (all same direction)
 */
function calculateSentimentConsistency(articleBreakdown: ArticleSentimentBreakdown[]): number {
  if (articleBreakdown.length === 0) return 0.5;
  if (articleBreakdown.length === 1) return 0.8; // Single article gets medium consistency

  // Count sentiment directions
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  for (const article of articleBreakdown) {
    if (article.sentiment === "positive") positiveCount++;
    else if (article.sentiment === "negative") negativeCount++;
    else neutralCount++;
  }

  const total = articleBreakdown.length;

  // Calculate alignment: what % of articles agree with the majority sentiment?
  const maxCount = Math.max(positiveCount, negativeCount, neutralCount);
  const alignment = maxCount / total;

  // Map alignment to consistency score:
  // 100% agreement → 1.0
  // 80% agreement → 0.95
  // 60% agreement → 0.85
  // 50% or less → 0.5-0.7 (mixed sentiment)

  if (alignment >= 0.8) return 0.95 + (alignment - 0.8) * 0.25; // 0.95 to 1.0
  if (alignment >= 0.6) return 0.85 + (alignment - 0.6) * 0.5; // 0.85 to 0.95

  // Below 60% agreement, we have mixed sentiment
  return 0.5 + (alignment - 0.33) * 0.5; // 0.5 to 0.7
}

/**
 * Use Claude AI to analyze sentiment of news articles
 * Returns more nuanced, context-aware sentiment analysis
 */
async function analyzeWithClaude(articles: NewsArticle[]): Promise<{
  score: number;
  positive: string[];
  negative: string[];
  reasoning: string;
}> {
  try {
    // Prepare article summaries for Claude
    const articleSummaries = articles.slice(0, 15).map((article, idx) => {
      const ageInHours = Math.floor(
        (new Date().getTime() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
      );
      return `${idx + 1}. [${ageInHours}h ago] ${article.title}${article.description ? ` - ${article.description}` : ""}`;
    }).join("\n");

    const prompt = `You are a financial sentiment analyst. Analyze these recent news headlines about a stock and provide:
1. A sentiment score from -1.0 (extremely bearish) to +1.0 (extremely bullish)
2. Key positive indicators (specific terms/phrases that suggest positive outlook)
3. Key negative indicators (specific terms/phrases that suggest negative outlook)
4. Brief reasoning for your assessment

News articles (newer articles listed first):
${articleSummaries}

Respond in JSON format:
{
  "score": <number between -1.0 and 1.0>,
  "positiveIndicators": [<array of specific positive terms/phrases found>],
  "negativeIndicators": [<array of specific negative terms/phrases found>],
  "reasoning": "<brief 2-3 sentence explanation>"
}

Consider:
- Specific financial metrics mentioned (earnings beats/misses, revenue growth, etc.)
- Analyst actions (upgrades, downgrades, price target changes)
- Product launches, regulatory approvals/issues
- Leadership changes
- Market position and competitive developments
- Recent news should carry more weight than older news
- Look for context - a "drop" might be positive if it's smaller than expected`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: prompt,
      }],
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const result = JSON.parse(content.text);

    return {
      score: Math.max(-1, Math.min(1, result.score || 0)),
      positive: result.positiveIndicators || [],
      negative: result.negativeIndicators || [],
      reasoning: result.reasoning || "",
    };
  } catch (error) {
    console.error("Claude AI analysis failed, falling back to basic sentiment:", error);
    // Fallback to basic sentiment analysis
    const fallbackAnalysis = analyzeArticleSentiment(articles[0] || { title: "", publishedAt: new Date() });
    return {
      score: fallbackAnalysis.score,
      positive: fallbackAnalysis.positive,
      negative: fallbackAnalysis.negative,
      reasoning: "Analysis performed using fallback method due to AI service unavailability",
    };
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Advanced multi-article sentiment analysis with weighting
 */
export async function analyzeNewsArticles(
  articles: NewsArticle[]
): Promise<DetailedSentimentResult> {
  // Step 0: Assess data quality
  const dataQuality = assessDataQuality(articles);

  // Handle insufficient data
  if (dataQuality === "insufficient" || articles.length === 0) {
    return {
      sentimentScore: 0,
      sentimentLabel: "Insufficient Data",
      analysis: articles.length === 0
        ? "Insufficient ticker-specific data to determine sentiment. No relevant news articles found for this stock."
        : "Insufficient ticker-specific data to determine sentiment. Need at least 3 relevant articles with meaningful content.",
      positiveIndicators: [],
      negativeIndicators: [],
      confidence: 0,
      articlesAnalyzed: articles.length,
      articleBreakdown: [],
      dataQuality: "insufficient",
    };
  }

  // Step 1: Deduplicate articles
  const uniqueArticles = deduplicateArticles(articles);

  // Step 2: Use Claude AI to analyze all articles together
  const claudeAnalysis = await analyzeWithClaude(uniqueArticles);

  // Step 3: Calculate weights for each article and build breakdown
  const weightedArticles: WeightedArticle[] = [];
  const articleBreakdown: ArticleSentimentBreakdown[] = [];

  for (const article of uniqueArticles) {
    const text = `${article.title} ${article.description || ""}`;
    const recencyWeight = calculateRecencyWeight(article.publishedAt);
    const specificityWeight = calculateSpecificityWeight(text);
    const impactResult = calculateImpactWeight(text);

    // Total weight is the product of all factors
    const totalWeight = recencyWeight * specificityWeight * impactResult.weight;

    // Analyze individual article sentiment (for breakdown purposes)
    const sentimentAnalysis = analyzeArticleSentiment(article);

    weightedArticles.push({
      article,
      recencyWeight,
      specificityWeight,
      impactWeight: impactResult.weight,
      totalWeight,
    });

    // Build per-article breakdown
    const hasNumericalData = /\d+/.test(text);
    let sentimentCategory: "positive" | "negative" | "neutral" = "neutral";
    if (sentimentAnalysis.score > 0.2) sentimentCategory = "positive";
    else if (sentimentAnalysis.score < -0.2) sentimentCategory = "negative";

    articleBreakdown.push({
      title: article.title,
      source: article.source || "Unknown",
      publishedAt: article.publishedAt,
      sentiment: sentimentCategory,
      score: sentimentAnalysis.score,
      weight: totalWeight,
      positiveTerms: sentimentAnalysis.positive,
      negativeTerms: sentimentAnalysis.negative,
      hasNumericalData,
      impactCategory: impactResult.category,
    });
  }

  // Step 4: Use Claude's overall sentiment score as the primary signal
  // Claude analyzes all articles together with better context understanding
  const finalScore = claudeAnalysis.score;

  // Step 5: Calculate confidence based on data quality, article count, and sentiment consistency
  let baseConfidence = 0;
  if (dataQuality === "high") {
    baseConfidence = Math.min(1.0, 0.7 + (uniqueArticles.length / 20) * 0.3);
  } else if (dataQuality === "medium") {
    baseConfidence = Math.min(0.7, 0.4 + (uniqueArticles.length / 10) * 0.3);
  } else {
    baseConfidence = Math.min(0.5, 0.2 + (uniqueArticles.length / 5) * 0.3);
  }

  // Calculate sentiment consistency (how aligned are the sentiments?)
  const sentimentConsistency = calculateSentimentConsistency(articleBreakdown);

  // Final confidence = base confidence * consistency factor
  let confidence = baseConfidence * sentimentConsistency;

  // Boost confidence if we have many articles (5+)
  if (uniqueArticles.length >= 5) {
    confidence = Math.min(1.0, confidence + 0.1);
  }

  // Step 6: Use Claude's indicators (enhanced by combining with local analysis)
  const allPositive: string[] = [];
  const allNegative: string[] = [];

  for (const breakdown of articleBreakdown) {
    allPositive.push(...breakdown.positiveTerms);
    allNegative.push(...breakdown.negativeTerms);
  }

  // Combine Claude's indicators with locally detected terms
  const positiveIndicators = [...new Set([...claudeAnalysis.positive, ...allPositive])].slice(0, 10);
  const negativeIndicators = [...new Set([...claudeAnalysis.negative, ...allNegative])].slice(0, 10);

  // Step 7: Generate analysis text using Claude's reasoning
  const label = scoreToLabel(finalScore, dataQuality);
  let analysis = "";

  // Add data quality context
  const qualityNote = dataQuality === "low"
    ? " (Note: Limited article quality - sentiment may be less reliable) "
    : "";

  // Use Claude's reasoning as the primary analysis
  analysis = `AI Analysis: ${claudeAnalysis.reasoning}${qualityNote}`;

  // Add indicator summary
  if (positiveIndicators.length > 0 && negativeIndicators.length > 0) {
    analysis += ` Key factors: Positive - ${positiveIndicators.slice(0, 3).join(", ")}. Negative - ${negativeIndicators.slice(0, 3).join(", ")}.`;
  } else if (positiveIndicators.length > 0) {
    analysis += ` Key positive factors: ${positiveIndicators.slice(0, 5).join(", ")}.`;
  } else if (negativeIndicators.length > 0) {
    analysis += ` Key negative factors: ${negativeIndicators.slice(0, 5).join(", ")}.`;
  }

  return {
    sentimentScore: Math.max(-1, Math.min(1, finalScore)),
    sentimentLabel: label,
    analysis,
    positiveIndicators,
    negativeIndicators,
    confidence: Math.max(0, Math.min(1, confidence)),
    articlesAnalyzed: uniqueArticles.length,
    articleBreakdown,
    dataQuality,
  };
}

/**
 * Simple sentiment analysis for user input (kept for compatibility)
 */
export async function analyzeUserExperience(userNote: string): Promise<{
  sentimentScore: number;
  explanation: string;
}> {
  if (!userNote || userNote.trim().length === 0) {
    return {
      sentimentScore: 0.5,
      explanation: "No user input provided",
    };
  }

  const result = sentiment.analyze(userNote);
  const normalizedScore = Math.max(0, Math.min(1, (result.score + 10) / 20));

  let explanation = "";
  const positiveWords = result.positive.length;
  const negativeWords = result.negative.length;

  if (normalizedScore > 0.6) {
    explanation = `Your input shows strong positive sentiment with ${positiveWords} positive indicators, suggesting confidence in the stock.`;
  } else if (normalizedScore < 0.4) {
    explanation = `Your input shows cautious or negative sentiment with ${negativeWords} concerning indicators, suggesting hesitation about the stock.`;
  } else {
    explanation = `Your input shows neutral sentiment with balanced perspective on the stock.`;
  }

  return {
    sentimentScore: normalizedScore,
    explanation,
  };
}
