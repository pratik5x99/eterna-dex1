import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

console.log(`🌐 Initializing Solana Connection to: ${RPC_URL}`);

export const solanaConnection = new Connection(RPC_URL, 'confirmed');