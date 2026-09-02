export interface StorageLocation {
  id: string;
  name: string;
  zone?: string;
  description?: string;
  createdAt: number;
}

/**
 * Storage locations are now fully user-defined.
 * No hardcoded locations are pre-populated by default.
 */
export const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [];

export const STORAGE_LOCATIONS_STORAGE_KEY = 'roboraiders_custom_storage_locations';

export function getStoredStorageLocations(): StorageLocation[] {
  try {
    const saved = localStorage.getItem(STORAGE_LOCATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read stored storage locations', err);
  }
  return [];
}

export function saveStoredStorageLocations(locations: StorageLocation[]): void {
  try {
    localStorage.setItem(STORAGE_LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
  } catch (err) {
    console.error('Failed to save stored storage locations', err);
  }
}
