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
