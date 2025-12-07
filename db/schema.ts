import { pgTable, serial, text, timestamp, real, jsonb } from "drizzle-orm/pg-core";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name"),
  lastPrice: real("last_price"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  historicalData: jsonb("historical_data"), // Store price history as JSON
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsSentiments = pgTable("news_sentiments", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").notNull(),
  headlines: jsonb("headlines").notNull(), // Array of headline strings
  sentimentScore: real("sentiment_score").notNull(), // -1 to 1
  explanation: text("explanation"),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

export const userInputs = pgTable("user_inputs", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").notNull(),
  userNote: text("user_note").notNull(),
  experienceScore: real("experience_score").notNull(), // 0 to 1
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").notNull(),
  technicalScore: real("technical_score").notNull(), // 0 to 1
  sentimentScore: real("sentiment_score").notNull(), // -1 to 1, normalized to 0-1
  experienceScore: real("experience_score").notNull(), // 0 to 1
  finalScore: real("final_score").notNull(), // 0 to 1
  label: text("label").notNull(), // "Bullish", "Neutral", "Bearish"
  details: jsonb("details"), // Store breakdown and additional info
  createdAt: timestamp("created_at").defaultNow(),
});

// Types for TypeScript
export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;

export type NewsSentiment = typeof newsSentiments.$inferSelect;
export type NewNewsSentiment = typeof newsSentiments.$inferInsert;

export type UserInput = typeof userInputs.$inferSelect;
export type NewUserInput = typeof userInputs.$inferInsert;

export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;
