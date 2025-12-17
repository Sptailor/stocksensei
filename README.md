# StockSensei 📈

AI-powered stock analysis platform combining technical indicators, news sentiment, and user insights.

🔗 **Live Demo:** [https://stocksensei-five.vercel.app/](https://stocksensei-five.vercel.app/)

## Features

- 🔍 Real-time stock quotes and historical data
- 📊 Technical analysis (SMA, EMA, RSI)
- 📉 Compression and breakout detection
- 🤖 AI-powered news sentiment analysis
- 🎯 Intelligent predictions based on multiple factors
- 📜 Prediction history tracking
- 🎨 Modern, futuristic UI

## How the Prediction Algorithm Works

StockSensei uses a multi-factor approach to generate stock predictions by combining technical analysis, AI-powered sentiment analysis, and volume pattern recognition.

### Three Core Components

**1. Technical Score (50% weight)**
- Calculated from multiple technical indicators: SMA (Simple Moving Average), EMA (Exponential Moving Average), and RSI (Relative Strength Index)
- Each indicator is scored and weighted to produce a technical score from 0-100
- Normalized to 0-1 range for the final calculation
- Identifies trend strength, momentum, and overbought/oversold conditions

**2. AI Sentiment Score (50% weight)**
- Claude AI analyzes recent news articles about the stock
- Produces a sentiment score ranging from -1 (very negative) to +1 (very positive)
- Normalized to 0-1 range for the final calculation
- Considers market sentiment, news tone, and headline analysis

**3. Volume Analysis (Dynamic adjustment)**
- Adds or subtracts up to ±0.15 from the final score based on volume patterns
- **Compression Zones**: Detects periods of price consolidation with declining volume (-0.05 adjustment)
  - Indicates potential breakout setup but adds caution until breakout occurs
- **Confirmed Breakouts**: Identifies price movements with strong volume confirmation
  - Bullish breakout: +0.15 adjustment
  - Bearish breakout: -0.15 adjustment
- **Unconfirmed Breakouts**: Price movements without volume confirmation (±0.05)
- **Volume Trends**: High relative volume (+0.05) or low volume (-0.03) adjustments

### The Formula

```
Base Score = (0.5 × Technical Score) + (0.5 × Sentiment Score)
Final Score = Base Score + Volume Signal Adjustment
Final Score = Clamped to range [0, 1]
```

### Prediction Labels

The final score is converted to a prediction label:
- **Bullish** (score ≥ 0.6): Positive outlook, upward momentum expected
- **Neutral** (0.4 ≤ score < 0.6): Mixed signals, uncertain direction
- **Bearish** (score < 0.4): Negative outlook, downward pressure expected

### Example Calculation

For AAPL with:
- Technical Score: 72/100 → normalized to 0.72
- Sentiment Score: +0.4 → normalized to 0.70
- Volume Signal: Confirmed bullish breakout → +0.15

```
Base Score = (0.5 × 0.72) + (0.5 × 0.70) = 0.71
Final Score = 0.71 + 0.15 = 0.86
Label = "Bullish" (since 0.86 ≥ 0.6)
```

This multi-factor approach ensures predictions consider both quantitative technical data and qualitative market sentiment, adjusted by real-time volume patterns that often precede significant price movements.

## Technical Indicators Explained

StockSensei analyzes stocks using several proven technical indicators to generate the technical score component of predictions.

### Moving Averages

**Simple Moving Average (SMA)**
- Calculates the average closing price over a specific period
- **SMA-20**: 20-day average, tracks short-term price trends
- **SMA-50**: 50-day average, identifies medium-term trends
- **Signal**: When SMA-20 crosses above SMA-50 (bullish) or below (bearish), it indicates trend direction changes

**Exponential Moving Average (EMA)**
- Similar to SMA but gives more weight to recent prices, making it more responsive
- **EMA-12**: 12-day exponential average for short-term momentum
- **EMA-26**: 26-day exponential average for medium-term momentum
- **Signal**: EMA-12 above EMA-26 suggests bullish momentum, below suggests bearish momentum

### Relative Strength Index (RSI)

- Measures the speed and magnitude of price changes on a scale of 0-100
- **Oversold (RSI < 30)**: Stock may be undervalued, potential buying opportunity (bullish signal)
- **Neutral (30 ≤ RSI ≤ 70)**: Stock is trading normally without extreme conditions
- **Overbought (RSI > 70)**: Stock may be overvalued, potential selling opportunity (bearish signal)
- RSI helps identify when a stock has moved too far in one direction and may reverse

### Volume Pattern Analysis

**Compression Zones**
- Periods where price consolidates in a narrow range with declining volume
- Indicates market indecision and often precedes significant price movements
- Detection criteria:
  - Price range narrower than 75% of average range
  - Volume below 80% of 20-day average
  - Must persist for at least 2 bars

**Breakouts**
- Occur when price breaks out of a compression zone
- **Bullish Breakout**: Price closes above compression high
- **Bearish Breakout**: Price closes below compression low
- **Volume Confirmation**: Relative volume ≥ 1.2x indicates institutional participation
- Confirmed breakouts are stronger signals than unconfirmed ones

**Volume Metrics**
- **Average Volume (20-day)**: Baseline for comparing current volume
- **Relative Volume (RVOL)**: Current volume divided by average volume
  - RVOL ≥ 1.5: High volume spike, increased interest
  - RVOL < 0.6: Low volume, reduced participation
- **Volume Spikes**: Days with RVOL ≥ 1.5, often signal important price action

### How Indicators Combine Into Technical Score

Each indicator generates a signal: +1 (bullish), 0 (neutral), or -1 (bearish)

1. **SMA Signal**: Compares SMA-20 to SMA-50
2. **EMA Signal**: Compares EMA-12 to EMA-26
3. **RSI Signal**: Checks if oversold, neutral, or overbought

The raw score is the sum of all signals (-3 to +3), then normalized:
```
Technical Score = ((Raw Score + 3) / 6) × 100
```

Example:
- SMA-20 > SMA-50: +1 (bullish)
- EMA-12 > EMA-26: +1 (bullish)
- RSI = 45: 0 (neutral)
- Raw Score = 2
- Technical Score = ((2 + 3) / 6) × 100 = 83.33

## Tech Stack

- **Next.js 15** + TypeScript
- **Neon PostgreSQL** + Drizzle ORM
- **Claude AI** for sentiment analysis
- **Yahoo Finance API** for stock data
- **shadcn/ui** + TailwindCSS

## Project Structure

```
stock-sensei/
├── app/
│   ├── api/
│   │   ├── stock/route.ts       # Stock data API
│   │   ├── sentiment/route.ts   # Sentiment analysis API
│   │   └── predict/route.ts     # Prediction API
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard page
│   ├── providers.tsx            # React Query provider
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── stock-search.tsx         # Search component
│   ├── stock-quote-card.tsx     # Quote display
│   ├── stock-chart.tsx          # Price chart
│   ├── technical-indicators-card.tsx
│   ├── sentiment-card.tsx
│   ├── user-experience-input.tsx
│   ├── prediction-card.tsx
│   └── prediction-history.tsx
├── db/
│   ├── schema.ts                # Database schema
│   ├── client.ts                # Database client
│   └── drizzle.config.ts        # Drizzle configuration
├── lib/
│   ├── indicators.ts            # Technical indicators
│   ├── sentiment.ts             # AI sentiment analysis
│   ├── yahoo.ts                 # Yahoo Finance integration
│   └── utils.ts                 # Utility functions
└── package.json
```

## Usage

1. Enter a stock symbol (e.g., AAPL, TSLA, MSFT)
2. View real-time data and technical indicators
3. Identify compression patterns and potential breakouts
4. AI analyzes news sentiment automatically
5. Generate AI-powered prediction
6. Track prediction history

## Disclaimer

⚠️ **Educational purposes only.** Not financial advice. Always do your own research before making investment decisions.
