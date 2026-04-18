import { kv } from "@vercel/kv";
import { AppContentSettings, Review } from "@/types/life";
import { DEFAULT_SETTINGS } from "@/lib/storage";
import { canUseRedisUrl, redisGetJson, redisSetJson } from "@/lib/redis-store";

type MemoryState = {
  settings: AppContentSettings;
  reviews: Review[];
};

const hasKvConfig = () => Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const getMemoryState = () => {
  const g = globalThis as unknown as { __lgaContentState?: MemoryState };
  if (!g.__lgaContentState) {
    g.__lgaContentState = {
      settings: DEFAULT_SETTINGS,
      reviews: [],
    };
  }
  return g.__lgaContentState;
};

const normalizeSettings = (raw?: Partial<AppContentSettings> & { donationUrl?: string }) => ({
  ...DEFAULT_SETTINGS,
  ...(raw ?? {}),
  donationAccount:
    raw?.donationAccount ?? raw?.donationUrl ?? DEFAULT_SETTINGS.donationAccount,
});

export const getSettings = async () => {
  if (hasKvConfig()) {
    const stored = await kv.get<Partial<AppContentSettings> & { donationUrl?: string }>(
      "lga:settings",
    );
    return normalizeSettings(stored ?? undefined);
  }
  if (canUseRedisUrl()) {
    const stored = await redisGetJson<Partial<AppContentSettings> & { donationUrl?: string }>(
      "lga:settings",
    );
    return normalizeSettings(stored ?? undefined);
  }
  return getMemoryState().settings;
};

export const updateSettings = async (partial: Partial<AppContentSettings>) => {
  const next = {
    ...(await getSettings()),
    ...partial,
  };

  if (hasKvConfig()) {
    await kv.set("lga:settings", next);
    return next;
  }
  if (canUseRedisUrl()) {
    await redisSetJson("lga:settings", next);
    return next;
  }
  const state = getMemoryState();
  state.settings = next;
  return next;
};

export const getReviews = async () => {
  if (hasKvConfig()) {
    return (await kv.get<Review[]>("lga:reviews")) ?? [];
  }
  if (canUseRedisUrl()) {
    return (await redisGetJson<Review[]>("lga:reviews")) ?? [];
  }
  return getMemoryState().reviews;
};

export const addReview = async (review: Review) => {
  const current = await getReviews();
  const next = [...current, review];
  if (hasKvConfig()) {
    await kv.set("lga:reviews", next);
    return next;
  }
  if (canUseRedisUrl()) {
    await redisSetJson("lga:reviews", next);
    return next;
  }
  const state = getMemoryState();
  state.reviews = next;
  return next;
};

export const removeReview = async (id: string) => {
  const current = await getReviews();
  const next = current.filter((item) => item.id !== id);
  if (hasKvConfig()) {
    await kv.set("lga:reviews", next);
    return next;
  }
  if (canUseRedisUrl()) {
    await redisSetJson("lga:reviews", next);
    return next;
  }
  const state = getMemoryState();
  state.reviews = next;
  return next;
};

export const clearReviews = async () => {
  if (hasKvConfig()) {
    await kv.set("lga:reviews", []);
    return [];
  }
  if (canUseRedisUrl()) {
    await redisSetJson("lga:reviews", []);
    return [];
  }
  const state = getMemoryState();
  state.reviews = [];
  return [];
};
