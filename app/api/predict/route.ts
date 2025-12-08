import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { predictions } from "@/db/schema";
import { getPredictionLabel, normalizeSentiment } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, technicalScore, sentimentScore, experienceScore } = body;

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    // Validate scores
    if (
      technicalScore === undefined ||
      sentimentScore === undefined ||
      experienceScore === undefined
    ) {
      return NextResponse.json({ error: "All scores required" }, { status: 400 });
    }

    // Normalize scores to 0-1 range
    // Technical score comes in as 0-100, normalize to 0-1
    const normalizedTechnical = technicalScore / 100;

    // Sentiment score from -1..1 to 0..1
    const normalizedSentiment = normalizeSentiment(sentimentScore);

    // Calculate final score using the formula:
    // finalScore = (0.4 * technical) + (0.4 * sentiment) + (0.2 * experience)
    const finalScore =
      0.4 * normalizedTechnical + 0.4 * normalizedSentiment + 0.2 * experienceScore;

    // Clamp to 0-1 range
    const clampedScore = Math.max(0, Math.min(1, finalScore));

    // Get prediction label
    const label = getPredictionLabel(clampedScore);

    // Prepare details
    const details = {
      weights: {
        technical: 0.4,
        sentiment: 0.4,
        experience: 0.2,
      },
      rawScores: {
        technical: technicalScore,
        technicalNormalized: normalizedTechnical,
        sentiment: sentimentScore,
        sentimentNormalized: normalizedSentiment,
        experience: experienceScore,
      },
      calculation: {
        technicalContribution: 0.4 * normalizedTechnical,
        sentimentContribution: 0.4 * normalizedSentiment,
        experienceContribution: 0.2 * experienceScore,
      },
    };

    // Store prediction in database
    const [prediction] = await db
      .insert(predictions)
      .values({
        stockSymbol: symbol.toUpperCase(),
        technicalScore,
        sentimentScore: normalizedSentiment,
        experienceScore,
        finalScore: clampedScore,
        label,
        details: details as any,
      })
      .returning();

    return NextResponse.json({
      prediction: {
        id: prediction.id,
        symbol: symbol.toUpperCase(),
        finalScore: clampedScore,
        label,
        technicalScore,
        sentimentScore: normalizedSentiment,
        experienceScore,
        details,
        createdAt: prediction.createdAt,
      },
    });
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create prediction" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = db.select().from(predictions);

    if (symbol) {
      query = query.where(eq(predictions.stockSymbol, symbol.toUpperCase())) as any;
    }

    const results = await query.orderBy(desc(predictions.createdAt)).limit(limit);

    return NextResponse.json({ predictions: results });
  } catch (error) {
    console.warn("Prediction GET API error (expected with placeholder DB):", error);
    // Return empty predictions list for demo mode
    return NextResponse.json({ predictions: [] });
  }
}
