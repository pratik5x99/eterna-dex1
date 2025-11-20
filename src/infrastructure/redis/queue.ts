import { Queue } from 'bullmq';
import { connection } from './connection';

export const orderQueue = new Queue('order-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Requirement: "Exponential back-off retry (≤3 attempts)"
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  }
});