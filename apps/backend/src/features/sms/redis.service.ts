import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface IMemoryEntry {
  readonly value: string;
  readonly expiresAt: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly memory = new Map<string, IMemoryEntry>();
  private useMemory = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.useMemory = true;
      this.logger.warn('REDIS_URL missing — using in-memory store');
      return;
    }
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      });
      this.client.on('error', (err) => {
        this.logger.warn(`Redis error: ${err.message}`);
        this.useMemory = true;
      });
      this.logger.log('Redis client initialized');
    } catch (err) {
      this.useMemory = true;
      this.logger.warn(
        `Redis unavailable — using in-memory store (${err instanceof Error ? err.message : 'error'})`,
      );
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.useMemory || !this.client) {
      this.memory.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return;
    }
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch {
      this.useMemory = true;
      await this.set(key, value, ttlSeconds);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemory || !this.client) {
      const entry = this.memory.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        this.memory.delete(key);
        return null;
      }
      return entry.value;
    }
    try {
      return await this.client.get(key);
    } catch {
      this.useMemory = true;
      return this.get(key);
    }
  }

  async del(key: string): Promise<void> {
    if (this.useMemory || !this.client) {
      this.memory.delete(key);
      return;
    }
    try {
      await this.client.del(key);
    } catch {
      this.useMemory = true;
      await this.del(key);
    }
  }

  async incr(key: string, ttlSeconds: number): Promise<number> {
    if (this.useMemory || !this.client) {
      const current = await this.get(key);
      const next = (current ? Number(current) : 0) + 1;
      await this.set(key, String(next), ttlSeconds);
      return next;
    }
    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      this.useMemory = true;
      return this.incr(key, ttlSeconds);
    }
  }
}
