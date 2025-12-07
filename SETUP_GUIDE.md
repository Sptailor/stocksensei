# StockSensei Setup Guide

This guide will walk you through setting up StockSensei from scratch.

## Step 1: Install Node.js

Make sure you have Node.js 18+ installed. Check your version:

```bash
node --version
```

If you need to install or update Node.js, visit [nodejs.org](https://nodejs.org)

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- TanStack Query
- Drizzle ORM
- Anthropic SDK
- yahoo-finance2
- shadcn/ui components

## Step 3: Set Up Neon Database

### Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### Get Your Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it should look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
   ```

### Add to Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your Neon connection string:
   ```env
   DATABASE_URL=postgresql://your-connection-string-here
   ```

## Step 4: Set Up Anthropic API

### Get Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to "API Keys"
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### Add to Environment Variables

Add your Anthropic API key to `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Your complete `.env` file should look like:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

## Step 5: Initialize Database

### Generate Migrations

```bash
npm run db:generate
```

This creates migration files based on the schema in `db/schema.ts`

### Run Migrations

```bash
npm run db:migrate
```

This applies the migrations to your Neon database, creating all necessary tables:
- `stocks`
- `news_sentiments`
- `user_inputs`
- `predictions`

### Verify (Optional)

You can view your database using Drizzle Studio:

```bash
npm run db:studio
```

This opens a web interface where you can see your tables and data.

## Step 6: Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter a stock symbol (e.g., "AAPL", "TSLA", "MSFT")
3. View the stock data and technical indicators
4. Wait for sentiment analysis to complete
5. Optionally add your own insights
6. Click "Generate Prediction"
7. View the final prediction and score

## Troubleshooting

### "DATABASE_URL is not set"

Make sure you've created a `.env` file and added your Neon connection string.

### "Failed to fetch stock data"

- Check your internet connection
- Verify the stock symbol is valid (use uppercase, e.g., "AAPL" not "aapl")
- Yahoo Finance might be temporarily unavailable - try again in a few minutes

### "Anthropic API error"

- Verify your API key is correct in `.env`
- Check you have credits/quota available in your Anthropic account
- Make sure the key starts with `sk-ant-`

### Database migration errors

- Ensure your DATABASE_URL is correct
- Check that your Neon database is running
- Try deleting the `drizzle/` folder and running migrations again

### Port 3000 already in use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
```

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
6. Click "Deploy"

Your app will be live at `your-project.vercel.app`

## Development Tips

### Database Management

- Use `npm run db:studio` to visually browse your database
- Schema changes? Update `db/schema.ts`, then run `npm run db:generate` and `npm run db:migrate`

### API Testing

You can test the APIs directly:

```bash
# Get stock data
curl http://localhost:3000/api/stock?symbol=AAPL

# Analyze sentiment
curl -X POST http://localhost:3000/api/sentiment \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","type":"news"}'

# Get predictions
curl http://localhost:3000/api/predict?symbol=AAPL&limit=5
```

### Viewing Logs

Check the terminal where you ran `npm run dev` for:
- API request logs
- Error messages
- Database queries

## Next Steps

- Customize the prediction algorithm in `lib/indicators.ts`
- Add more technical indicators
- Integrate additional news sources
- Enhance the UI with more visualizations
- Add user authentication

## Need Help?

- Check the main [README.md](./README.md)
- Review the code in `app/`, `components/`, and `lib/`
- Open an issue on GitHub

Happy analyzing! 📈
