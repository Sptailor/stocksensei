import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface SentimentResult {
  sentimentScore: number; // -1 to 1
  explanation: string;
}

/**
 * Analyze news headlines sentiment using Claude API
 */
export async function analyzeNewsSentiment(headlines: string[]): Promise<SentimentResult> {
  try {
    if (!headlines || headlines.length === 0) {
      return {
        sentimentScore: 0,
        explanation: "No headlines provided for analysis",
      };
    }

    const prompt = `Analyze the following news headlines and determine the overall sentiment for the stock.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Please provide:
1. A sentiment score between -1 and 1, where:
   - -1 = Very Bearish (extremely negative)
   - -0.5 = Bearish (negative)
   - 0 = Neutral
   - 0.5 = Bullish (positive)
   - 1 = Very Bullish (extremely positive)

2. A brief explanation (2-3 sentences) of why you assigned this score.

Format your response as JSON:
{
  "sentimentScore": <number>,
  "explanation": "<string>"
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse sentiment response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate score is within bounds
    const score = Math.max(-1, Math.min(1, result.sentimentScore));

    return {
      sentimentScore: score,
      explanation: result.explanation || "No explanation provided",
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
 * Analyze user experience input and convert to score
 */
export async function analyzeUserExperience(userNote: string): Promise<SentimentResult> {
  try {
    if (!userNote || userNote.trim().length === 0) {
      return {
        sentimentScore: 0.5,
        explanation: "No user input provided",
      };
    }

    const prompt = `A user has provided their personal observation about a stock investment:

"${userNote}"

Based on this observation, provide:
1. An experience score between 0 and 1, where:
   - 0 = Very negative/pessimistic outlook
   - 0.5 = Neutral/uncertain
   - 1 = Very positive/optimistic outlook

2. A brief explanation (1-2 sentences) of why you assigned this score.

Format your response as JSON:
{
  "sentimentScore": <number>,
  "explanation": "<string>"
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse experience response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate score is within bounds (0 to 1 for experience)
    const score = Math.max(0, Math.min(1, result.sentimentScore));

    return {
      sentimentScore: score,
      explanation: result.explanation || "No explanation provided",
    };
  } catch (error) {
    console.error("Error analyzing user experience:", error);
    return {
      sentimentScore: 0.5,
      explanation: "Error analyzing user input, defaulting to neutral",
    };
  }
}
