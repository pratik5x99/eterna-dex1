# ⚡ HyperFlash: Low-Latency Order Execution Engine

HyperFlash is a high-performance, event-driven trading engine capable of routing orders to the best DEX (Raydium vs Meteora) with minimal latency. Built with **Node.js, Fastify, BullMQ, and Redis**.

## 🚀 Features
- **Smart Order Routing:** Real-time price comparison between DEXs to guarantee best execution.
- **Event-Driven Architecture:** Uses Redis Pub/Sub for sub-millisecond updates to the frontend.
- **Concurrency:** Handles high-throughput order processing using BullMQ (Exponential Backoff & Atomic locking).
- **Resilience:** Dockerized infrastructure with persistent PostgreSQL storage.

## 🛠️ Tech Stack
- **Runtime:** Node.js (TypeScript)
- **API Framework:** Fastify (Lower overhead than Express)
- **Queue System:** BullMQ + Redis
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod

## 🏗️ Architecture Decisions
1.  **Why BullMQ?** Trading systems require strict ordering and reliability. BullMQ provides robust queue management with retry logic (exponential backoff) which ensures that if a DEX is temporarily down, the order isn't lost but retried gracefully.

2.  **Why Fastify over Express?**
    Fastify was chosen for its low overhead and built-in support for `async/await`, allowing us to handle higher requests per second (RPS) which is critical for High-Frequency Trading (HFT) simulations.

3.  **Mock Implementation (Strategy):**
    Used the `IDexProvider` interface pattern (Dependency Inversion). This allows the system to switch between `MockDexProvider` and a real `SolanaWeb3` provider without changing a single line of the core business logic.

## 🏃‍♂️ Local Setup

1. **Clone & Install**
   ```bash
   npm install