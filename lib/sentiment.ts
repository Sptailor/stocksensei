import Sentiment from "sentiment";

const sentiment = new Sentiment();

export interface SentimentResult {
  sentimentScore: number; // -1 to 1
  explanation: string;
}

/**
 * Analyze news headlines sentiment using free local sentiment analysis
 */
export async function analyzeNewsSentiment(headlines: string[]): Promise<SentimentResult> {
  try {
    if (!headlines || headlines.length === 0) {
      return {
        sentimentScore: 0,
        explanation: "No headlines provided for analysis",
      };
    }

    // Combine all headlines into one text
    const combinedText = headlines.join(" ");

    // Analyze sentiment
    const result = sentiment.analyze(combinedText);

    // Normalize score from sentiment library range to -1..1
    // Sentiment library typically gives scores ranging roughly from -10 to +10
    // We'll normalize to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, result.score / 10));

    // Generate explanation based on score
    let explanation = "";
    const positiveWords = result.positive.length;
    const negativeWords = result.negative.length;

    if (normalizedScore > 0.3) {
      explanation = `Positive sentiment detected with ${positiveWords} positive words. Headlines suggest bullish outlook with terms like: ${result.positive.slice(0, 3).join(", ")}.`;
    } else if (normalizedScore < -0.3) {
      explanation = `Negative sentiment detected with ${negativeWords} negative words. Headlines suggest bearish outlook with terms like: ${result.negative.slice(0, 3).join(", ")}.`;
    } else {
      explanation = `Neutral sentiment detected. Headlines show balanced sentiment with ${positiveWords} positive and ${negativeWords} negative indicators.`;
    }

    return {
      sentimentScore: normalizedScore,
      explanation: explanation,
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentimentScore: 0,
      explanation: "Error analyzing sentiment, defaulting to neutral",
    };
  }
}

/**
 * Analyze user experience input and convert to score (0 to 1)
 */
export async function analyzeUserExperience(userNote: string): Promise<SentimentResult> {
  try {
    if (!userNote || userNote.trim().length === 0) {
      return {
        sentimentScore: 0.5,
        explanation: "No user input provided",
      };
    }

    // Analyze sentiment of user's note
    const result = sentiment.analyze(userNote);

    // Normalize score from sentiment library range to 0..1 (for experience score)
    // Convert -10..10 range to 0..1 range
    const normalizedScore = Math.max(0, Math.min(1, (result.score + 10) / 20));

    // Generate explanation based on user's input sentiment
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
      explanation: explanation,
    };
  } catch (error) {
    console.error("Error analyzing user experience:", error);
    return {
      sentimentScore: 0.5,
      explanation: "Error analyzing user input, defaulting to neutral",
    };
  }
}
