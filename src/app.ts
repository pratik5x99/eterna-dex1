import fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { orderRoutes } from './api/routes/order.routes';

const app = fastify({ logger: true });

// 1. Register Plugins
app.register(cors, { origin: '*' });
app.register(websocket);

// Register Static File Serving (For the Dashboard)
app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
});

// 2. Register Routes
app.register(orderRoutes, { prefix: '/api' });

// Serve index.html at root
app.get('/', async (req, reply) => {
  return reply.sendFile('index.html');
});

app.get('/health', async () => {
  return { status: 'ok' };
});

export default app;