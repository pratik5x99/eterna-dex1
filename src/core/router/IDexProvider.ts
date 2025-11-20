export interface Quote {
  price: number;
  fee: number;
  dexName: string;
}

export interface IDexProvider {
  name: string;
  getQuote(tokenIn: string, tokenOut: string, amount: number): Promise<Quote>;
}