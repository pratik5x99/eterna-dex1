import { WebSocket } from 'ws';
import { FastifyRequest } from 'fastify';
import { redisSubscriber } from '../../infrastructure/redis/connection';

const clients = new Map<string, WebSocket>();

redisSubscriber.subscribe('order-updates', (err) => {
  if (err) console.error('Failed to subscribe to order-updates:', err);
});

redisSubscriber.on('message', (channel, message) => {
  if (channel === 'order-updates') {
    try {
      const event = JSON.stringify(JSON.parse(message));
      const data = JSON.parse(message);
      const client = clients.get(data.orderId);
      
      if (client && client.readyState === 1) { 
        client.send(event);
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  }
});

// FIX: Bulletproof socket extraction
export const handleWebSocket = (connection: any, req: FastifyRequest) => {
  // Fastify WebSocket sometimes passes the socket directly or inside an object
  // We check both possibilities to be safe.
  const socket = connection.socket || connection;

  const query = req.query as { orderId?: string };
  const orderId = query.orderId;

  if (!orderId) {
    socket.close(1008, 'OrderId required');
    return;
  }

  console.log(`🔌 [WS] Client connected for Order #${orderId}`);
  
  clients.set(orderId, socket);

  // FIX: Ensure we attach the listener to the correct object
  if (socket.on) {
    socket.on('close', () => {
      clients.delete(orderId);
      console.log(`🔌 [WS] Client disconnected (${orderId})`);
    });
  } else {
    console.error("❌ Critical: Could not find .on method on socket object", socket);
  }
};