# StockSensei 📈

An AI-powered stock analysis and prediction platform that combines technical indicators, news sentiment analysis, and user insights to generate comprehensive stock predictions.

## Features

- 🔍 **Real-time Stock Data** - Fetch live stock quotes and historical data using Yahoo Finance
- 📊 **Technical Analysis** - Calculate SMA, EMA, RSI and other indicators
- 🤖 **AI Sentiment Analysis** - Analyze news headlines using Claude AI
- 💭 **User Experience Input** - Include your own insights in predictions
- 🎯 **Prediction Algorithm** - Combine multiple factors for final prediction:
  - 40% Technical Indicators
  - 40% News Sentiment
  - 20% User Experience
- 📜 **Prediction History** - Track all your past predictions
- 🎨 **Modern UI** - Clean, responsive design with dark/light mode

## Tech Stack

### Frontend & Backend
- **Next.js 15** (App Router, TypeScript)
- **React 18**
- **shadcn/ui** + TailwindCSS for UI components
- **TanStack Query** for data fetching
- **Recharts** for data visualization

### Database
- **Neon PostgreSQL** (serverless)
- **Drizzle ORM**

### AI & APIs
- **Claude API** (Anthropic) for sentiment analysis
- **yahoo-finance2** NPM package for stock data

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database
- Anthropic API key (for Claude)

### Installation

1. **Clone the repository**
   ```bash
   cd stock-sensei
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your credentials:
   ```env
   DATABASE_URL=your_neon_postgres_connection_string
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

   **Getting your credentials:**
   - **Neon Database**: Sign up at [neon.tech](https://neon.tech), create a project, and copy the connection string
   - **Anthropic API**: Sign up at [console.anthropic.com](https://console.anthropic.com), get your API key

4. **Generate and run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Search for a stock** by entering its symbol (e.g., AAPL, TSLA, MSFT)
2. View **real-time price** and **technical indicators**
3. **News sentiment** is automatically analyzed
4. Optionally **add your own insights** about the stock
5. Click **"Generate Prediction"** to get the AI-powered analysis
6. View your **prediction history** in the sidebar

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

## Database Schema

The application uses 4 main tables:

- **stocks** - Cached stock data and prices
- **news_sentiments** - Sentiment analysis results
- **user_inputs** - User experience scores
- **predictions** - Final prediction results

## Prediction Algorithm

```typescript
finalScore =
  (0.4 × technicalScore) +
  (0.4 × sentimentScore) +
  (0.2 × experienceScore)
```

**Labels:**
- **Bullish** - Score ≥ 0.6
- **Neutral** - 0.4 ≤ Score < 0.6
- **Bearish** - Score < 0.4

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Disclaimer

⚠️ **This tool is for educational and informational purposes only.** Stock predictions are based on historical data and sentiment analysis and should not be considered as financial advice. Always do your own research and consult with financial professionals before making investment decisions.

## Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Claude AI, and modern web technologies.
