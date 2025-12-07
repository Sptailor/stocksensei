# Quick Start Guide

Get StockSensei up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Neon database (free tier is fine)
- An Anthropic API key

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your credentials
# DATABASE_URL=your_neon_connection_string
# ANTHROPIC_API_KEY=your_anthropic_key

# 4. Run database migrations
npm run db:generate
npm run db:migrate

# 5. Start the development server
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Enter a stock symbol (e.g., AAPL)
3. View analysis and generate prediction

## Getting Your API Keys

### Neon Database
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy connection string from dashboard

### Anthropic API
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys
3. Create and copy new key

## Need More Help?

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## Test It Works

Search for "AAPL" or "TSLA" to see:
- Live stock price
- Technical indicators (SMA, EMA, RSI)
- AI sentiment analysis
- Final prediction score

That's it! You're ready to analyze stocks with AI. 🚀
