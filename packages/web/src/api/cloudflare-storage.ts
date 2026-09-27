type R2ObjectBodyLike = {
  body?: ReadableStream<Uint8Array> | null;
  httpMetadata?: { contentType?: string };
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
};

type R2ListResultLike = {
  objects: Array<{ key: string }>;
  truncated: boolean;
  cursor?: string;
};

export type R2BucketLike = {
  get(key: string): Promise<R2ObjectBodyLike | null>;
  head(key: string): Promise<unknown | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | Blob | ReadableStream | null,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2ListResultLike>;
};

let storage: R2BucketLike | null = null;

export function configureCloudflareStorage(bucket: R2BucketLike | null) {
  storage = bucket;
}

export function cloudflareStorage() {
  return storage;
}

export async function readJsonFromR2<T>(key: string): Promise<T | null> {
  const bucket = cloudflareStorage();
  if (!bucket) return null;

  const object = await bucket.get(key);
  if (!object) return null;
  return JSON.parse(await object.text()) as T;
}

export async function writeJsonToR2(key: string, value: unknown) {
  const bucket = cloudflareStorage();
  if (!bucket) return false;

  await bucket.put(key, `${JSON.stringify(value, null, 2)}\n`, {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  return true;
}

export async function listR2Keys(prefix: string, max = 5000) {
  const bucket = cloudflareStorage();
  if (!bucket) return [];

  const keys: string[] = [];
  let cursor: string | undefined;

  while (keys.length < max) {
    const page = await bucket.list({ prefix, limit: Math.min(1000, max - keys.length), cursor });
    keys.push(...page.objects.map((object) => object.key));
    if (!page.truncated || !page.cursor) break;
    cursor = page.cursor;
  }

  return keys;
}
