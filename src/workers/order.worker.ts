import { Worker, Job } from 'bullmq';
import { connection, redisPublisher } from '../infrastructure/redis/connection';
import { SmartRouter } from '../core/router/SmartRouter';
import { prisma } from '../infrastructure/database/client';

// What the job data looks like
interface OrderJobData {
  orderId: string;
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

const router = new SmartRouter();

export const orderWorker = new Worker('order-queue', async (job: Job<OrderJobData>) => {
  const { orderId, tokenIn, tokenOut, amount } = job.data;
  
  console.log(`👷 [Worker] Processing Order #${orderId}`);

  try {
    // 1. STATUS: ROUTING
    await updateStatus(orderId, 'ROUTING');
    const quote = await router.getBestQuote(tokenIn, tokenOut, amount);

    // 2. STATUS: BUILDING -> SUBMITTED
    await updateStatus(orderId, 'BUILDING');
    // Simulate transaction building
    await new Promise(r => setTimeout(r, 500)); 
    
    await updateStatus(orderId, 'SUBMITTED');
    // Simulate network confirmation
    await new Promise(r => setTimeout(r, 1000));

    // 3. STATUS: CONFIRMED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        price: quote.price,
        txHash: `0x${Math.random().toString(36).substring(7)}...mock`, // Mock Hash
      }
    });
    
    // Publish final event
    await publishEvent(orderId, 'CONFIRMED', { 
      price: quote.price, 
      txHash: 'mock-tx-hash' 
    });

    console.log(`✅ [Worker] Order #${orderId} Complete!`);

  } catch (error: any) {
    console.error(`❌ [Worker] Order #${orderId} Failed:`, error);
    
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'FAILED',
        failReason: error.message
      }
    });
    
    await publishEvent(orderId, 'FAILED', { reason: error.message });
  }

}, {
  connection,
  concurrency: 10 // Requirement: "Process up to 10 concurrent orders"
});

// --- Helpers ---

async function updateStatus(orderId: string, status: any) {
  // Update DB
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  // Notify WS
  await publishEvent(orderId, status);
}

async function publishEvent(orderId: string, status: string, data: any = {}) {
  const event = JSON.stringify({ orderId, status, ...data });
  await redisPublisher.publish('order-updates', event);
}