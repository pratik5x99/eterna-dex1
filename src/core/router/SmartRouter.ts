import { IDexProvider, Quote } from './IDexProvider';
import { MockRaydium, MockMeteora } from '../../infrastructure/dex/MockDexProvider';
import { RealRaydium, RealMeteora } from '../../infrastructure/dex/RealDexProvider';
import dotenv from 'dotenv';

dotenv.config();

export class SmartRouter {
  private providers: IDexProvider[];

  constructor() {
    const mode = process.env.EXECUTION_MODE || 'mock';
    console.log(`🚀 Router initializing in ${mode.toUpperCase()} mode`);

    if (mode === 'real') {
      // Use Real Solana Connection
      this.providers = [RealRaydium, RealMeteora];
    } else {
      // Use Mock
      this.providers = [MockRaydium, MockMeteora];
    }
  }

  async getBestQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
    console.log(`[Router] Routing ${amount} ${tokenIn} -> ${tokenOut}...`);

    const quotePromises = this.providers.map(p => p.getQuote(tokenIn, tokenOut, amount));
    const quotes = await Promise.all(quotePromises);

    let bestQuote = quotes[0];
    for (const quote of quotes) {
      console.log(`   - ${quote.dexName}: $${quote.price.toFixed(2)}`);
      if (quote.price < bestQuote.price) {
        bestQuote = quote;
      }
    }

    console.log(`✅ [Router] Best Route: ${bestQuote.dexName} ($${bestQuote.price.toFixed(2)})`);
    return bestQuote;
  }
}