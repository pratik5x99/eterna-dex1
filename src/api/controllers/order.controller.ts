import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/client';
import { orderQueue } from '../../infrastructure/redis/queue';

// Validation Schema (Type Safety)
const orderSchema = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  amount: z.number().positive(),
});

export const createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // 1. Validate Input
    const body = orderSchema.parse(request.body);

    // 2. Create Database Record (Initial State: PENDING)
    const order = await prisma.order.create({
      data: {
        type: 'MARKET', // We hardcode Market as per our decision
        side: 'BUY',    // Simplified for demo
        quantity: body.amount,
        tokenIn: body.tokenIn,
        tokenOut: body.tokenOut,
        status: 'PENDING',
      },
    });

    // 3. Add to Queue (The "Async" Magic)
    await orderQueue.add('execute-order', {
      orderId: order.id,
      tokenIn: body.tokenIn,
      tokenOut: body.tokenOut,
      amount: body.amount,
    });

    // 4. Return immediate response (Low Latency!)
    return reply.code(201).send({
      orderId: order.id,
      status: 'PENDING',
      message: 'Order received and queued for execution',
    });

  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({ error: 'Invalid order data' });
  }
};