import { NextRequest, NextResponse } from "next/server";
import { getStockQuote, getStockHistory, convertToPriceData, searchStocks } from "@/lib/yahoo";
import { calculateTechnicalScore, getIndicatorDetails } from "@/lib/indicators";
import { db } from "@/db/client";
import { stocks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const action = searchParams.get("action");

    // Search stocks
    if (action === "search") {
      const query = searchParams.get("query");
      if (!query) {
        return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
      }

      const results = await searchStocks(query);
      return NextResponse.json({ results });
    }

    // Get stock data
    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter required" }, { status: 400 });
    }

    // Fetch quote and history
    const [quote, history] = await Promise.all([
      getStockQuote(symbol.toUpperCase()),
      getStockHistory(symbol.toUpperCase(), "6mo"),
    ]);

    // Calculate technical indicators
    const priceData = convertToPriceData(history);
    const technicalScore = calculateTechnicalScore(priceData);
    const indicators = getIndicatorDetails(priceData);

    // Store in database (skip if using placeholder)
    try {
      await db
        .insert(stocks)
        .values({
          symbol: symbol.toUpperCase(),
          name: quote.name,
          lastPrice: quote.price,
          historicalData: history as any,
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: stocks.symbol,
          set: {
            name: quote.name,
            lastPrice: quote.price,
            historicalData: history as any,
            lastUpdated: new Date(),
          },
        });
    } catch (dbError) {
      console.warn("Database storage failed (this is expected with placeholder DB)");
    }

    return NextResponse.json({
      quote,
      history,
      technicalScore,
      indicators,
    });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
