import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { predictions } from "@/db/schema";
import { getPredictionLabel, normalizeSentiment } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, technicalScore, sentimentScore, experienceScore, volumeAnalysis } = body;

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

    // Analyze volume patterns for additional signals
    let volumeSignal = 0;
    let compressionStatus = "none";
    let breakoutStatus = "none";
    const insights: string[] = [];

    if (volumeAnalysis) {
      const { volumeMetrics, compressionZones, breakouts, dataLength } = volumeAnalysis;

      // Check if currently in compression (zone ends within last 5 bars)
      const inCompression = compressionZones.some(
        (zone: { endIndex: number }) => zone.endIndex >= dataLength - 5
      );

      if (inCompression) {
        compressionStatus = "active";
        insights.push("⚠️ Stock is currently in a compression zone - potential breakout setup");
        volumeSignal -= 0.05; // Slightly bearish when compressed
      }

      // Check for recent breakouts (occurred within last 10 bars)
      const recentBreakout = breakouts.find(
        (b: { index: number }) => b.index >= dataLength - 10
      );

      if (recentBreakout) {
        breakoutStatus = recentBreakout.type;
        if (recentBreakout.confirmed) {
          if (recentBreakout.type === "bullish") {
            insights.push("🚀 Confirmed bullish breakout detected with strong volume");
            volumeSignal += 0.15; // Strong bullish signal
          } else {
            insights.push("📉 Confirmed bearish breakout detected with strong volume");
            volumeSignal -= 0.15; // Strong bearish signal
          }
        } else {
          if (recentBreakout.type === "bullish") {
            insights.push("⚡ Bullish breakout detected but lacks volume confirmation");
            volumeSignal += 0.05; // Weak bullish signal
          } else {
            insights.push("⚡ Bearish breakout detected but lacks volume confirmation");
            volumeSignal -= 0.05; // Weak bearish signal
          }
        }
      }

      // Volume trend analysis
      if (volumeMetrics.isHighVolume) {
        insights.push("📊 High relative volume - increased institutional interest");
        volumeSignal += 0.05;
      } else if (volumeMetrics.isLowVolume) {
        insights.push("📊 Low volume - reduced trading activity, caution advised");
        volumeSignal -= 0.03;
      }

      // Volume spikes
      if (volumeMetrics.volumeSpikes.length > 3) {
        insights.push(`🔥 ${volumeMetrics.volumeSpikes.length} volume spikes detected - increased volatility`);
      }
    }

    // Calculate final score using the formula with volume adjustment:
    // finalScore = (0.5 * technical) + (0.5 * sentiment) + volumeSignal
    // Note: experienceScore is kept at neutral 0.5 but not weighted in calculation
    const baseScore =
      0.5 * normalizedTechnical + 0.5 * normalizedSentiment;

    const finalScore = baseScore + volumeSignal;

    // Clamp to 0-1 range
    const clampedScore = Math.max(0, Math.min(1, finalScore));

    // Get prediction label
    const label = getPredictionLabel(clampedScore);

    // Prepare details
    const details = {
      weights: {
        technical: 0.5,
        sentiment: 0.5,
        volumeAdjustment: volumeSignal,
      },
      rawScores: {
        technical: technicalScore,
        technicalNormalized: normalizedTechnical,
        sentiment: sentimentScore,
        sentimentNormalized: normalizedSentiment,
      },
      calculation: {
        technicalContribution: 0.5 * normalizedTechnical,
        sentimentContribution: 0.5 * normalizedSentiment,
        volumeContribution: volumeSignal,
        baseScore: baseScore,
      },
      volumeAnalysis: {
        compressionStatus,
        breakoutStatus,
        insights,
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
        details: details as Record<string, unknown>,
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

    const query = symbol
      ? db.select().from(predictions).where(eq(predictions.stockSymbol, symbol.toUpperCase()))
      : db.select().from(predictions);

    const results = await query.orderBy(desc(predictions.createdAt)).limit(limit);

    return NextResponse.json({ predictions: results });
  } catch (error) {
    console.warn("Prediction GET API error (expected with placeholder DB):", error);
    // Return empty predictions list for demo mode
    return NextResponse.json({ predictions: [] });
  }
}
