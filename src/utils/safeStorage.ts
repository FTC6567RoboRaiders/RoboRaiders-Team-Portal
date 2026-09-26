/**
 * Safe Persistent Storage Architecture for FTC RoboRaiders Studio
 * 
 * Solves:
 * 1. Uncaught QuotaExceededError when saving large data (outreach events, journal logs, CAD photos).
 * 2. Automatic dual-layer fallback to IndexedDB and in-memory storage.
 * 3. Graceful recovery when browser LocalStorage is full or cleared.
 * 4. Transparent global monkeypatch on Storage.prototype so all components and effects are protected.
 */

const DB_NAME = 'ftc_storage_db';
const STORE_NAME = 'keyvalue_pairs';
const DB_VERSION = 1;

// In-memory mirror for instantaneous, synchronous zero-quota-limit operations
const memoryStore = new Map<string, string>();

// Disposable / cache keys that can be purged if quota is hit
const DISPOSABLE_KEYS = [
  'ftc_dispatched_emails',
  'ftc_dismissed_announcements',
  'roboraiders_help_bookmarks',
  'ftc_active_clock_in'
];

let idbDatabasePromise: Promise<IDBDatabase | null> | null = null;

function getIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (idbDatabasePromise) {
    return idbDatabasePromise;
  }

  idbDatabasePromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[SafeStorage] IndexedDB open error, falling back to memoryStore');
        resolve(null);
      };
    } catch (e) {
      console.warn('[SafeStorage] IndexedDB initialization failed', e);
      resolve(null);
    }
  });

  return idbDatabasePromise;
}

export async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await getIndexedDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, value, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve(); // Non-blocking
      } catch {
        resolve();
      }
    });
  } catch (err) {
    console.warn(`[SafeStorage] IDB set error for key: ${key}`, err);
  }
}

export async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await getIndexedDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && typeof req.result.value === 'string') {
            resolve(req.result.value);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await getIndexedDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

export async function hydrateFromIndexedDB(): Promise<void> {
  try {
    const db = await getIndexedDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          if (Array.isArray(req.result)) {
            let restoredCount = 0;
            req.result.forEach((item: { key: string; value: string }) => {
              if (item && item.key && item.value) {
                memoryStore.set(item.key, item.value);
                // If localStorage is missing this key, try putting it back
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    const current = window.localStorage.getItem(item.key);
                    if (!current || current === '[]' || current === '{}') {
                      window.localStorage.setItem(item.key, item.value);
                      restoredCount++;
                    }
                  }
                } catch {
                  // Ignore quota on restoration
                }
              }
            });
            if (restoredCount > 0) {
              window.dispatchEvent(new CustomEvent('ftc_storage_hydrated', { detail: { restoredCount } }));
            }
          }
          resolve();
        };
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

function isStorageQuotaError(e: unknown): boolean {
  if (!e) return false;
  if (e instanceof DOMException) {
    return (
      e.code === 22 ||
      e.code === 1014 ||
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    );
  }
  const msg = e instanceof Error ? e.message : String(e);
  const lower = msg.toLowerCase();
  return lower.includes('quota') || lower.includes('exceeded') || lower.includes('storage full');
}

/**
 * Installs global safeguard on window.localStorage to completely prevent
 * uncaught QuotaExceededError from ever crashing the UI.
 */
function installStorageGuard() {
  if (typeof window === 'undefined' || !window.Storage) return;

  const storageProto = window.Storage.prototype;
  const originalSetItem = storageProto.setItem;
  const originalGetItem = storageProto.getItem;
  const originalRemoveItem = storageProto.removeItem;

  if ((window as any).__FTC_STORAGE_GUARD_INSTALLED__) {
    return;
  }
  (window as any).__FTC_STORAGE_GUARD_INSTALLED__ = true;

  // Intercept setItem
  storageProto.setItem = function (key: string, value: any) {
    const stringKey = String(key);
    const stringValue = String(value);

    // 1. Mirror into instantaneous in-memory store
    memoryStore.set(stringKey, stringValue);

    // 2. Schedule persistent background write to IndexedDB
    idbSet(stringKey, stringValue).catch(() => {});

    // 3. Attempt write to target storage (usually localStorage)
    try {
      originalSetItem.call(this, stringKey, stringValue);
    } catch (err: unknown) {
      if (isStorageQuotaError(err)) {
        console.warn(`[SafeStorage] LocalStorage quota exceeded when writing "${stringKey}". Executing quota recovery...`);

        // Emergency purge of disposable cache keys from localStorage
        try {
          for (const dispKey of DISPOSABLE_KEYS) {
            if (dispKey !== stringKey) {
              originalRemoveItem.call(this, dispKey);
            }
          }
        } catch {}

        // Retry saving after disposable cache eviction
        try {
          originalSetItem.call(this, stringKey, stringValue);
          console.info(`[SafeStorage] Successfully wrote "${stringKey}" after purging disposable cache.`);
          return;
        } catch {
          // If still exceeded, safely swallow the error!
          // The data is already intact in memoryStore and IndexedDB!
          console.warn(`[SafeStorage] "${stringKey}" saved to IndexedDB & memory (LocalStorage remains full). QuotaExceededError suppressed.`);
          return;
        }
      }

      // If any other unexpected storage error occurs (e.g. Safari private mode), swallow safely
      console.warn(`[SafeStorage] Storage write error on "${stringKey}":`, err);
    }
  };

  // Intercept getItem
  storageProto.getItem = function (key: string): string | null {
    const stringKey = String(key);
    try {
      const val = originalGetItem.call(this, stringKey);
      if (val !== null && val !== undefined) {
        return val;
      }
    } catch {}

    // Fall back to memoryStore
    if (memoryStore.has(stringKey)) {
      return memoryStore.get(stringKey) || null;
    }
    return null;
  };

  // Intercept removeItem
  storageProto.removeItem = function (key: string) {
    const stringKey = String(key);
    memoryStore.delete(stringKey);
    idbRemove(stringKey).catch(() => {});
    try {
      originalRemoveItem.call(this, stringKey);
    } catch {}
  };
}

// Auto-install on module import
installStorageGuard();

// Start background hydration
if (typeof window !== 'undefined') {
  hydrateFromIndexedDB().catch(console.error);
}

/**
 * Explicit helper API for application code
 */
export const safeStorage = {
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore.set(key, value);
      }
    } catch {
      memoryStore.set(key, value);
    }
  },

  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {}
    return memoryStore.get(key) || null;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    memoryStore.delete(key);
    idbRemove(key).catch(() => {});
  },

  async getItemAsync(key: string): Promise<string | null> {
    const syncVal = safeStorage.getItem(key);
    if (syncVal !== null) return syncVal;
    return await idbGet(key);
  }
};
