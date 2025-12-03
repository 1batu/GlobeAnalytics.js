const cache = new Map();

export const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

export const setCache = (key, value, ttlSeconds = 300) => {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiry });
};

// Auto-cleanup every 60 seconds to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
    }
  }
}, 60000);
