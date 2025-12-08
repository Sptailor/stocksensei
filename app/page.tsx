"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StockSearch } from "@/components/stock-search";
import { StockQuoteCard } from "@/components/stock-quote-card";
import { StockChart } from "@/components/stock-chart";
import { TechnicalIndicatorsCard } from "@/components/technical-indicators-card";
import { SentimentCard } from "@/components/sentiment-card";
import { UserExperienceInput } from "@/components/user-experience-input";
import { PredictionCard } from "@/components/prediction-card";
import { PredictionHistory } from "@/components/prediction-history";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [experienceData, setExperienceData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  // Fetch stock data
  const { data: stockData, isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock", selectedStock],
    queryFn: async () => {
      if (!selectedStock) return null;
      const res = await fetch(`/api/stock?symbol=${selectedStock}`);
      if (!res.ok) throw new Error("Failed to fetch stock data");
      return res.json();
    },
    enabled: !!selectedStock,
  });

  // Fetch sentiment
  const sentimentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: selectedStock, type: "news" }),
      });
      if (!res.ok) throw new Error("Failed to analyze sentiment");
      return res.json();
    },
    onSuccess: (data) => {
      setSentimentData(data);
    },
  });

  // Analyze user experience
  const experienceMutation = useMutation({
    mutationFn: async (userNote: string) => {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock,
          type: "experience",
          userNote,
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze experience");
      return res.json();
    },
    onSuccess: (data) => {
      setExperienceData(data);
    },
  });

  // Create prediction
  const predictionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock,
          technicalScore: stockData?.technicalScore || 0.5,
          sentimentScore: sentimentData?.sentimentScore || 0,
          experienceScore: experienceData?.experienceScore || 0.5,
        }),
      });
      if (!res.ok) throw new Error("Failed to create prediction");
      return res.json();
    },
    onSuccess: (data) => {
      setPrediction(data.prediction);
      historyQuery.refetch();
    },
  });

  // Fetch prediction history
  const historyQuery = useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const res = await fetch("/api/predict?limit=10");
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
  });

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setSentimentData(null);
    setExperienceData(null);
    setPrediction(null);
  };

  const handleGeneratePrediction = () => {
    if (!stockData) return;

    // Auto-fetch sentiment if not already done
    if (!sentimentData) {
      sentimentMutation.mutate();
    }

    // Use default experience score if user hasn't provided input
    if (!experienceData) {
      setExperienceData({ experienceScore: 0.5, explanation: "Default neutral score" });
    }

    // Small delay to ensure state is updated
    setTimeout(() => {
      predictionMutation.mutate();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 grid-background">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-glow">
            StockSensei
          </h1>
          <p className="text-lg text-blue-200/80">
            AI-Powered Stock Analysis & Prediction Platform
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></div>
            <p className="text-sm text-blue-300/60 font-mono">Real-time Market Intelligence</p>
            <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <StockSearch onSelectStock={handleSelectStock} />
        </div>

        {/* Loading State */}
        {isLoadingStock && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-blue-300/60 font-mono text-sm">Analyzing market data...</p>
          </div>
        )}

        {/* Main Content */}
        {stockData && !isLoadingStock && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <StockQuoteCard quote={stockData.quote} />
              <StockChart data={stockData.history} />
              <TechnicalIndicatorsCard
                indicators={stockData.indicators}
                score={stockData.technicalScore}
              />

              {sentimentData && (
                <SentimentCard
                  sentimentScore={sentimentData.sentimentScore}
                  sentimentLabel={sentimentData.sentimentLabel}
                  explanation={sentimentData.explanation}
                  headlines={sentimentData.headlines}
                  positiveIndicators={sentimentData.positiveIndicators}
                  negativeIndicators={sentimentData.negativeIndicators}
                  confidence={sentimentData.confidence}
                  articlesAnalyzed={sentimentData.articlesAnalyzed}
                />
              )}

              <UserExperienceInput
                onSubmit={(note) => experienceMutation.mutate(note)}
                isLoading={experienceMutation.isPending}
              />

              {/* Generate Prediction Button */}
              {!prediction && (
                <Button
                  onClick={handleGeneratePrediction}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all relative overflow-hidden group"
                  size="lg"
                  disabled={predictionMutation.isPending || sentimentMutation.isPending}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {predictionMutation.isPending || sentimentMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating Prediction...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Prediction
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {prediction && <PredictionCard prediction={prediction} />}

              <PredictionHistory predictions={historyQuery.data?.predictions || []} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedStock && !isLoadingStock && (
          <div className="text-center py-20">
            <div className="glass-card max-w-2xl mx-auto p-12 rounded-2xl border border-blue-500/20">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-blue-100 mb-3">Ready to Analyze</h3>
              <p className="text-blue-300/70 mb-6">
                Enter a stock symbol above to unlock AI-powered market intelligence
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => handleSelectStock('AAPL')} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all">AAPL</button>
                <button onClick={() => handleSelectStock('TSLA')} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all">TSLA</button>
                <button onClick={() => handleSelectStock('GOOGL')} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all">GOOGL</button>
                <button onClick={() => handleSelectStock('MSFT')} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all">MSFT</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
