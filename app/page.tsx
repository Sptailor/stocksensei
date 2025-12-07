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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            StockSensei
          </h1>
          <p className="text-muted-foreground">
            AI-Powered Stock Analysis & Prediction Platform
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <StockSearch onSelectStock={handleSelectStock} />
        </div>

        {/* Loading State */}
        {isLoadingStock && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  explanation={sentimentData.explanation}
                  headlines={sentimentData.headlines}
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
                  className="w-full"
                  size="lg"
                  disabled={predictionMutation.isPending || sentimentMutation.isPending}
                >
                  {predictionMutation.isPending || sentimentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating Prediction...
                    </>
                  ) : (
                    "Generate Prediction"
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Enter a stock symbol above to get started with AI-powered analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
