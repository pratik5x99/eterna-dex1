import app from './app';
import dotenv from 'dotenv';
import './workers/order.worker'; // This starts the worker listener

dotenv.config();

const PORT = 3000;

const start = async () => {
  try {

    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 HyperFlash Engine running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();