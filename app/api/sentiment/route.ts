import { NextRequest, NextResponse } from "next/server";
import { analyzeNewsArticles, analyzeUserExperience, type NewsArticle } from "@/lib/sentiment-advanced";
import { fetchWithMultiQuery } from "@/lib/multi-query-fetcher";
import { db } from "@/db/client";
import { newsSentiments, userInputs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, type, articles, userNote } = body;

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    // Analyze news sentiment using advanced multi-article analysis
    if (type === "news") {
      let newsArticles: NewsArticle[] = articles || [];
      let newsSources: string[] = [];
      let newsQuality: string = "unknown";

      // If no articles provided, fetch using multi-query multi-source system
      if (!newsArticles || newsArticles.length === 0) {
        console.log(`Fetching ticker-specific news for ${symbol} using multi-query expansion...`);

        const fetchResult = await fetchWithMultiQuery(symbol, {
          minArticles: 3,
          targetArticles: 5,
          minRelevanceScore: 0.55,
          logExpansion: true,
        });

        // Check if fetch was successful
        if (!fetchResult.success) {
          console.warn(`Multi-query fetch failed: ${fetchResult.message}`);
          return NextResponse.json({
            sentimentScore: 0,
            sentimentLabel: "Insufficient Data",
            explanation: fetchResult.message,
            analysis: fetchResult.message,
            positiveIndicators: [],
            negativeIndicators: [],
            confidence: 0,
            articlesAnalyzed: fetchResult.relevantCount,
            dataQuality: "insufficient",
            fetchStats: {
              totalFetched: fetchResult.totalFetched,
              relevantCount: fetchResult.relevantCount,
              queriesUsed: fetchResult.queriesUsed,
              sourcesUsed: fetchResult.sourcesUsed,
              relevanceRate: fetchResult.relevanceRate,
            },
          });
        }

        newsArticles = fetchResult.articles;
        newsSources = fetchResult.sourcesUsed;
        newsQuality = fetchResult.relevantCount >= 5 ? "high" : "medium";

        console.log(`Multi-query fetch complete:`, {
          articlesFound: fetchResult.relevantCount,
          totalFetched: fetchResult.totalFetched,
          queriesUsed: fetchResult.queriesUsed.length,
          relevanceRate: `${(fetchResult.relevanceRate * 100).toFixed(1)}%`,
          success: fetchResult.success,
        });
      }

      // Perform advanced sentiment analysis
      const result = await analyzeNewsArticles(newsArticles);

      console.log(`Sentiment analysis for ${symbol}:`, {
        score: result.sentimentScore,
        label: result.sentimentLabel,
        confidence: result.confidence,
        articlesAnalyzed: result.articlesAnalyzed,
        dataQuality: result.dataQuality,
      });

      // Only store in database if we have sufficient data
      if (result.dataQuality !== "insufficient") {
        try {
          await db.insert(newsSentiments).values({
            stockSymbol: symbol.toUpperCase(),
            headlines: newsArticles.map(a => a.title) as string[],
            sentimentScore: result.sentimentScore,
            explanation: result.analysis,
          });
        } catch {
          console.warn("Database storage failed (expected in demo mode)");
        }
      }

      return NextResponse.json({
        sentimentScore: result.sentimentScore,
        sentimentLabel: result.sentimentLabel,
        explanation: result.analysis,
        analysis: result.analysis,
        positiveIndicators: result.positiveIndicators,
        negativeIndicators: result.negativeIndicators,
        confidence: result.confidence,
        articlesAnalyzed: result.articlesAnalyzed,
        dataQuality: result.dataQuality,
        articleBreakdown: result.articleBreakdown,
        headlines: newsArticles.map(a => a.title),
        articles: newsArticles.slice(0, 10), // Return top 10 articles
        sources: newsSources,
        newsQuality,
      });
    }

    // Analyze user experience
    if (type === "experience") {
      if (!userNote) {
        return NextResponse.json({ error: "User note required" }, { status: 400 });
      }

      const result = await analyzeUserExperience(userNote);

      // Store in database (with error handling for demo mode)
      try {
        await db.insert(userInputs).values({
          stockSymbol: symbol.toUpperCase(),
          userNote,
          experienceScore: result.sentimentScore,
          explanation: result.explanation,
        });
      } catch (dbError) {
        console.warn("Database storage failed (expected in demo mode):", dbError);
      }

      return NextResponse.json({
        experienceScore: result.sentimentScore,
        explanation: result.explanation,
      });
    }

    return NextResponse.json({ error: "Invalid type parameter. Use 'news' or 'experience'" }, { status: 400 });
  } catch (error) {
    console.error("Sentiment API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze sentiment",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent sentiment analysis
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter required" }, { status: 400 });
    }

    // Fetch latest sentiment from database
    try {
      const results = await db
        .select()
        .from(newsSentiments)
        .where(eq(newsSentiments.stockSymbol, symbol.toUpperCase()))
        .orderBy(desc(newsSentiments.analyzedAt))
        .limit(1);

      const latestSentiment = results[0];

      if (latestSentiment) {
        return NextResponse.json({
          sentimentScore: latestSentiment.sentimentScore,
          explanation: latestSentiment.explanation,
          headlines: latestSentiment.headlines,
          analyzedAt: latestSentiment.analyzedAt,
        });
      }

      return NextResponse.json({ error: "No sentiment data found for this symbol" }, { status: 404 });
    } catch {
      console.warn("Database query failed");
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
  } catch (error) {
    console.error("Sentiment GET API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sentiment" },
      { status: 500 }
    );
  }
}
