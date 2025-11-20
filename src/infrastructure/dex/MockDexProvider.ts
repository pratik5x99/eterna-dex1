import { IDexProvider, Quote } from '../../core/router/IDexProvider';

// Helper to simulate network delay (2-3 seconds as requested)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockDexProvider implements IDexProvider {
  public name: string;
  private basePrice: number;
  private variance: number;

  constructor(name: string, basePrice: number, variance: number) {
    this.name = name;
    this.basePrice = basePrice;
    this.variance = variance;
  }

  async getQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote> {
    console.log(`[${this.name}] Fetching quote for ${amount} ${tokenIn}...`);
    
    // Requirement: "Simulate DEX responses with realistic delays (2-3 seconds)"
    await delay(2000 + Math.random() * 1000);

    // Requirement: "Mock price variations between DEXs"
    // We add random variance to the base price
    const randomFactor = 1 + (Math.random() * this.variance * 2 - this.variance); // +/- variance
    const price = this.basePrice * randomFactor;

    return {
      price: price,
      fee: amount * 0.003, // 0.3% fee
      dexName: this.name
    };
  }
}

// We export two instances with slightly different behaviors
export const MockRaydium = new MockDexProvider("Raydium", 100, 0.05); // Higher variance
export const MockMeteora = new MockDexProvider("Meteora", 100.5, 0.02); // Slightly higher base, lower variance