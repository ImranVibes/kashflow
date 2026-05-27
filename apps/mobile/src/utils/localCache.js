/**
 * localCache.js
 *
 * Persists data locally in AsyncStorage so the app works instantly offline
 * and data is never lost even if the remote DB has issues.
 *
 * Strategy:
 *  1. On every successful API fetch → save snapshot to AsyncStorage
 *  2. On app open → load the snapshot first (zero network latency)
 *  3. API data always wins when available (keeps local in sync)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "expense_tracker_cache_";

export const localCache = {
  /** Save any JSON-serializable value under the given key */
  async save(key, value) {
    try {
      const payload = JSON.stringify({ value, savedAt: Date.now() });
      await AsyncStorage.setItem(PREFIX + key, payload);
    } catch (e) {
      console.warn(`[localCache] save(${key}) failed:`, e.message);
    }
  },

  /** Load a previously saved value. Returns { value, savedAt } or null. */
  async load(key) {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[localCache] load(${key}) failed:`, e.message);
      return null;
    }
  },

  /** Remove a cached entry */
  async clear(key) {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.warn(`[localCache] clear(${key}) failed:`, e.message);
    }
  },

  /** Clear ALL expense tracker caches (e.g. on logout) */
  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ours = keys.filter((k) => k.startsWith(PREFIX));
      if (ours.length > 0) await AsyncStorage.multiRemove(ours);
    } catch (e) {
      console.warn("[localCache] clearAll failed:", e.message);
    }
  },
};

/**
 * A tiny React hook that:
 *  - reads the cache for `cacheKey` on mount
 *  - exposes `initialData` you can pass to useQuery
 *  - exposes `persistData(data)` to save after every successful fetch
 */
import { useState, useEffect, useCallback } from "react";

export function usePersistedQuery(cacheKey) {
  const [initialData, setInitialData] = useState(undefined);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  useEffect(() => {
    localCache.load(cacheKey).then((cached) => {
      if (cached?.value !== undefined) {
        setInitialData(cached.value);
      }
      setCacheLoaded(true);
    });
  }, [cacheKey]);

  const persistData = useCallback(
    (data) => {
      localCache.save(cacheKey, data);
    },
    [cacheKey],
  );

  return { initialData, cacheLoaded, persistData };
}
