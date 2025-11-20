import request from 'supertest';
import app from '../src/app'; // We test the Fastify app directly
import { SmartRouter } from '../src/core/router/SmartRouter';
import { prisma } from '../src/infrastructure/database/client';
import { connection, redisPublisher, redisSubscriber } from '../src/infrastructure/redis/connection';
import { handleWebSocket } from '../src/api/websockets/status.ws';

// --- MOCKS ---
const mockSocket = {
  send: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
  readyState: 1, // OPEN
};

describe('⚡ HyperFlash System Tests', () => {
  
  // FIX: Reset mocks before every test so history doesn't bleed over
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Cleanup after tests
  afterAll(async () => {
    await prisma.$disconnect();
    await connection.quit();
    await redisPublisher.quit();
    await redisSubscriber.quit();
    await app.close();
  });

  // ---------------------------------------------------------
  // PART 1: UNIT TESTS - Smart Router Logic
  // ---------------------------------------------------------
  describe('Core: SmartRouter Logic', () => {
    const router = new SmartRouter();

    test('1. Should fetch quotes from both providers', async () => {
      const quote = await router.getBestQuote('SOL', 'USDC', 1);
      expect(quote).toBeDefined();
      expect(quote.price).toBeGreaterThan(0);
    });

    test('2. Should return a valid DEX name (Raydium or Meteora)', async () => {
      const quote = await router.getBestQuote('SOL', 'USDC', 1);
      expect(['Raydium', 'Meteora']).toContain(quote.dexName);
    });

    test('3. Fee calculation should be accurate (0.3%)', async () => {
      const quote = await router.getBestQuote('SOL', 'USDC', 100);
      expect(quote.fee).toBe(100 * 0.003);
    });
  });

  // ---------------------------------------------------------
  // PART 2: INTEGRATION TESTS - API & Queue
  // ---------------------------------------------------------
  describe('API: Order Endpoints', () => {
    
    test('4. POST /api/orders should create an order (201 Created)', async () => {
      await app.ready();
      const res = await request(app.server)
        .post('/api/orders')
        .send({
          tokenIn: 'SOL',
          tokenOut: 'USDC',
          amount: 5
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('orderId');
      expect(res.body.status).toBe('PENDING');
    });

    test('5. Should validate input (Reject negative amount)', async () => {
      const res = await request(app.server)
        .post('/api/orders')
        .send({
          tokenIn: 'SOL',
          tokenOut: 'USDC',
          amount: -5 // Invalid
        });

      expect(res.status).toBe(400);
    });

    test('6. Database should reflect the PENDING status immediately', async () => {
      // Create an order via API
      const res = await request(app.server)
        .post('/api/orders')
        .send({ tokenIn: 'BTC', tokenOut: 'USDT', amount: 1 });
      
      const orderId = res.body.orderId;

      // Check DB directly
      const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
      expect(dbOrder).toBeDefined();
      expect(dbOrder?.status).toBe('PENDING');
    });
  });

  // ---------------------------------------------------------
  // PART 3: UNIT TESTS - WebSocket Lifecycle
  // ---------------------------------------------------------
  describe('WebSocket: Connection Logic', () => {
    
    test('7. Should reject connection without orderId', () => {
      const req: any = { query: {} }; // Empty query
      
      // We pass the mock socket directly
      handleWebSocket(mockSocket, req);
      
      expect(mockSocket.close).toHaveBeenCalledWith(1008, 'OrderId required');
    });

    test('8. Should accept connection with valid orderId', () => {
      const req: any = { query: { orderId: 'test-uuid' } };
      
      // Reset implies 'close' has 0 calls now
      handleWebSocket(mockSocket, req);
      
      // It should NOT close
      expect(mockSocket.close).not.toHaveBeenCalledWith(1008, expect.any(String));
    });

    test('9. Health Check endpoint returns 200', async () => {
      const res = await request(app.server).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('10. Verify Queue Logic (Static Check)', () => {
       expect(connection.status).toBe('ready');
    });
  });
});