import crypto from "crypto";
import { kv } from "@vercel/kv";
import {
  canUseRedisUrl,
  redisDelete,
  redisGetJson,
  redisPushLog,
  redisReadLogs,
  redisSetJson,
} from "@/lib/redis-store";

const ACCESS_CODE_PREFIX = "LGA1";

type AccessCodeRecord = {
  exp: number;
  createdAt: number;
};

type MemoryStore = Map<string, AccessCodeRecord>;
type AccessLogEntry = {
  usedAt: number;
  ip: string;
  userAgent: string;
  codeTail: string;
};

const getMemoryStore = () => {
  const g = globalThis as unknown as {
    __lgaAccessCodes?: MemoryStore;
    __lgaAccessLogs?: AccessLogEntry[];
  };
  if (!g.__lgaAccessCodes) {
    g.__lgaAccessCodes = new Map<string, AccessCodeRecord>();
  }
  return g.__lgaAccessCodes;
};

const getMemoryLogs = () => {
  const g = globalThis as unknown as {
    __lgaAccessCodes?: MemoryStore;
    __lgaAccessLogs?: AccessLogEntry[];
  };
  if (!g.__lgaAccessLogs) {
    g.__lgaAccessLogs = [];
  }
  return g.__lgaAccessLogs;
};

const getSecret = () => process.env.ACCESS_CODE_SECRET || process.env.ADMIN_PASSWORD || "";
const hasKvConfig = () => Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const normalizeCode = (code: string) => code.trim().toUpperCase();
const buildStoreKey = (code: string) => {
  const secret = getSecret();
  if (!secret) throw new Error("ACCESS_CODE_SECRET 또는 ADMIN_PASSWORD가 필요합니다.");
  return `lga:access:${crypto.createHash("sha256").update(`${secret}:${code}`).digest("hex")}`;
};

const randomChunk = (size: number) =>
  crypto.randomBytes(size).toString("base64url").replace(/[^A-Z0-9]/gi, "").slice(0, size).toUpperCase();

const createCodeValue = () =>
  `${ACCESS_CODE_PREFIX}-${randomChunk(5)}-${randomChunk(5)}-${randomChunk(5)}`;

const setRecord = async (key: string, record: AccessCodeRecord, ttlSeconds: number) => {
  if (hasKvConfig()) {
    await kv.set(key, record, { ex: Math.max(60, ttlSeconds) });
    return;
  }
  if (canUseRedisUrl()) {
    await redisSetJson(key, record, Math.max(60, ttlSeconds));
    return;
  }
  getMemoryStore().set(key, record);
};

const getRecord = async (key: string) => {
  if (hasKvConfig()) {
    const record = await kv.get<AccessCodeRecord>(key);
    return record;
  }
  if (canUseRedisUrl()) {
    return await redisGetJson<AccessCodeRecord>(key);
  }
  return getMemoryStore().get(key) ?? null;
};

const deleteRecord = async (key: string) => {
  if (hasKvConfig()) {
    await kv.del(key);
    return;
  }
  if (canUseRedisUrl()) {
    await redisDelete(key);
    return;
  }
  getMemoryStore().delete(key);
};

const logUsage = async (entry: AccessLogEntry) => {
  if (hasKvConfig()) {
    await kv.lpush("lga:access:logs", JSON.stringify(entry));
    await kv.ltrim("lga:access:logs", 0, 199);
    return;
  }
  if (canUseRedisUrl()) {
    await redisPushLog("lga:access:logs", entry, 200);
    return;
  }
  const logs = getMemoryLogs();
  logs.unshift(entry);
  if (logs.length > 200) {
    logs.length = 200;
  }
};

export const generateOneTimeAccessCodes = async (count: number, validDays: number) => {
  const expiresAt = Date.now() + Math.max(1, validDays) * 24 * 60 * 60 * 1000;
  const ttlSeconds = Math.floor((expiresAt - Date.now()) / 1000);
  const codes: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const code = createCodeValue();
    const normalized = normalizeCode(code);
    const key = buildStoreKey(normalized);
    await setRecord(
      key,
      {
        exp: expiresAt,
        createdAt: Date.now(),
      },
      ttlSeconds,
    );
    codes.push(code);
  }

  return codes;
};

export const consumeOneTimeAccessCode = async (
  rawCode: string,
  meta?: { ip?: string; userAgent?: string },
) => {
  const code = normalizeCode(rawCode);
  if (!code.startsWith(`${ACCESS_CODE_PREFIX}-`)) {
    return { ok: false as const, reason: "invalid-format" };
  }

  let key = "";
  try {
    key = buildStoreKey(code);
  } catch {
    return { ok: false as const, reason: "secret-missing" };
  }

  const record = await getRecord(key);
  if (!record) {
    return { ok: false as const, reason: "not-found-or-used" };
  }
  if (!record.exp || Date.now() > record.exp) {
    await deleteRecord(key);
    return { ok: false as const, reason: "expired" };
  }

  await deleteRecord(key);
  await logUsage({
    usedAt: Date.now(),
    ip: meta?.ip?.slice(0, 80) || "unknown",
    userAgent: meta?.userAgent?.slice(0, 160) || "unknown",
    codeTail: code.slice(-6),
  });
  return { ok: true as const, exp: record.exp };
};

export const listAccessLogs = async () => {
  if (hasKvConfig()) {
    const rows = await kv.lrange<string>("lga:access:logs", 0, 99);
    return rows
      .map((row) => {
        try {
          return JSON.parse(row) as AccessLogEntry;
        } catch {
          return null;
        }
      })
      .filter((item): item is AccessLogEntry => Boolean(item));
  }
  if (canUseRedisUrl()) {
    return (await redisReadLogs<AccessLogEntry>("lga:access:logs", 0, 99)) ?? [];
  }
  return getMemoryLogs().slice(0, 100);
};
