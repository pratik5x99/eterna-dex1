import { IDexProvider, Quote } from './IDexProvider';
import { MockRaydium, MockMeteora } from '../../infrastructure/dex/MockDexProvider';

export class SmartRouter {
  private providers: IDexProvider[];

  constructor() {
    // We inject our mock providers here
    this.providers = [MockRaydium, MockMeteora];
  }

  async getBestQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
    console.log(`🚀 [Router] Routing ${amount} ${tokenIn} -> ${tokenOut}...`);

    // Query all providers in parallel (Efficiency!)
    const quotePromises = this.providers.map(p => p.getQuote(tokenIn, tokenOut, amount));
    const quotes = await Promise.all(quotePromises);

    // Find the best price (Lowest price if buying, but for this mock we assume buying so lower is better? 
    // Actually, usually higher return is better. Let's assume we want the Lowest Price for buying X with Y)
    // Let's keep it simple: We want the LOWEST price.
    
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