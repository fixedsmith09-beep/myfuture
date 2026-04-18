import { createClient } from "redis";

const hasRedisUrl = () => Boolean(process.env.REDIS_URL);

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let connectingPromise: Promise<RedisClient> | null = null;

const getRedisClient = async () => {
  if (!hasRedisUrl()) return null;
  if (redisClient?.isOpen) return redisClient;

  if (!connectingPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    connectingPromise = client.connect().then(() => {
      redisClient = client;
      return client;
    });
  }

  return connectingPromise;
};

export const canUseRedisUrl = hasRedisUrl;

export const redisSetJson = async (key: string, value: unknown, ttlSeconds?: number) => {
  const client = await getRedisClient();
  if (!client) return false;

  const payload = JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    await client.set(key, payload, { EX: ttlSeconds });
  } else {
    await client.set(key, payload);
  }
  return true;
};

export const redisGetJson = async <T>(key: string) => {
  const client = await getRedisClient();
  if (!client) return null;
  const raw = await client.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const redisDelete = async (key: string) => {
  const client = await getRedisClient();
  if (!client) return false;
  await client.del(key);
  return true;
};

export const redisPushLog = async (listKey: string, value: unknown, keepMax: number) => {
  const client = await getRedisClient();
  if (!client) return false;
  await client.lPush(listKey, JSON.stringify(value));
  await client.lTrim(listKey, 0, keepMax - 1);
  return true;
};

export const redisReadLogs = async <T>(listKey: string, start: number, stop: number) => {
  const client = await getRedisClient();
  if (!client) return null;
  const rows = await client.lRange(listKey, start, stop);
  return rows
    .map((row) => {
      try {
        return JSON.parse(row) as T;
      } catch {
        return null;
      }
    })
    .filter((item): item is T => Boolean(item));
};
