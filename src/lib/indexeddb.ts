/**
 * IndexedDB wrapper for caching data locally
 * Provides fast local access with optional Neon database backup
 */

const DB_NAME = "sonichigo_cache";
const DB_VERSION = 1;

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
}

// Store names
export const STORES = {
  POSTS: "posts",
  REPOS: "repos",
  PROFILE: "profile",
  IMAGES: "images",
} as const;

/**
 * Initialize IndexedDB
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: "key" });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      });
    };
  });
}

/**
 * Save data to IndexedDB
 */
export async function saveToCache<T>(
  storeName: string,
  key: string,
  data: T,
  ttlMs?: number
): Promise<void> {
  const db = await initDB();

  const entry: CacheEntry<T> = {
    key,
    data,
    timestamp: Date.now(),
    ...(ttlMs && { expiresAt: Date.now() + ttlMs }),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get data from IndexedDB
 */
export async function getFromCache<T>(
  storeName: string,
  key: string
): Promise<T | null> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          // Delete expired entry
          deleteFromCache(storeName, key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

/**
 * Delete data from IndexedDB
 */
export async function deleteFromCache(
  storeName: string,
  key: string
): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all entries from a store
 */
export async function getAllFromStore<T>(
  storeName: string
): Promise<CacheEntry<T>[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
