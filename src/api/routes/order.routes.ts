import { FastifyInstance } from 'fastify';
import { createOrder } from '../controllers/order.controller';
import { handleWebSocket } from '../websockets/status.ws';

export async function orderRoutes(app: FastifyInstance) {
  // HTTP POST /orders
  app.post('/orders', createOrder);

  // WebSocket /ws/orders
  app.get('/ws/orders', { websocket: true }, handleWebSocket);
}