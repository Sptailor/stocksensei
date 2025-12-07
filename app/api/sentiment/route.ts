import { NextRequest, NextResponse } from "next/server";
import { analyzeNewsSentiment, analyzeUserExperience } from "@/lib/sentiment";
import { getStockNews } from "@/lib/yahoo";
import { db } from "@/db/client";
import { newsSentiments, userInputs } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, type, headlines, userNote } = body;

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    // Analyze news sentiment
    if (type === "news") {
      let newsHeadlines = headlines;

      // If no headlines provided, fetch from Yahoo Finance
      if (!newsHeadlines || newsHeadlines.length === 0) {
        newsHeadlines = await getStockNews(symbol);
      }

      const result = await analyzeNewsSentiment(newsHeadlines);

      // Store in database
      await db.insert(newsSentiments).values({
        stockSymbol: symbol.toUpperCase(),
        headlines: newsHeadlines as any,
        sentimentScore: result.sentimentScore,
        explanation: result.explanation,
      });

      return NextResponse.json({
        sentimentScore: result.sentimentScore,
        explanation: result.explanation,
        headlines: newsHeadlines,
      });
    }

    // Analyze user experience
    if (type === "experience") {
      if (!userNote) {
        return NextResponse.json({ error: "User note required" }, { status: 400 });
      }

      const result = await analyzeUserExperience(userNote);

      // Store in database
      await db.insert(userInputs).values({
        stockSymbol: symbol.toUpperCase(),
        userNote,
        experienceScore: result.sentimentScore,
        explanation: result.explanation,
      });

      return NextResponse.json({
        experienceScore: result.sentimentScore,
        explanation: result.explanation,
      });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Sentiment API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
