export interface StorageLocation {
  id: string;
  name: string;
  zone?: string;
  description?: string;
  subAreas?: string[]; // Sub-areas, shelves, bins, or compartments within this location
  createdAt: number;
}

/**
 * Storage locations are user-defined.
 */
export const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
  {
    id: 'loc-cab-a',
    name: 'Cabinet A',
    zone: 'Robotics Lab',
    description: 'Hardware, structural extrusions, and motion parts',
    subAreas: ['Shelf 1 (Motors & Servos)', 'Shelf 2 (Gears & Pulleys)', 'Shelf 3 (Extrusions)', 'Bottom Bin'],
    createdAt: 1725000000000
  },
  {
    id: 'loc-pit-cart',
    name: 'Pit Cart',
    zone: 'Competition Pit',
    description: 'Portable cart for FTC regional and championship events',
    subAreas: ['Top Tray (Hand Tools)', 'Tote 1 (Spare Hubs & Sensors)', 'Tote 2 (Fasteners)', 'Battery Bay'],
    createdAt: 1725000000000
  },
  {
    id: 'loc-elec-bench',
    name: 'Electronics Station',
    zone: 'Electronics Lab',
    description: 'Control hubs, wiring, motor cables, and testing tools',
    subAreas: ['Drawer 1 (Control Hubs)', 'Drawer 2 (Sensors & Cables)', 'Battery Charging Rack'],
    createdAt: 1725000000000
  }
];

export const STORAGE_LOCATIONS_STORAGE_KEY = 'roboraiders_custom_storage_locations';

export function getStoredStorageLocations(): StorageLocation[] {
  try {
    const saved = localStorage.getItem(STORAGE_LOCATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          subAreas: Array.isArray(item.subAreas) ? item.subAreas : []
        }));
      }
    }
  } catch (err) {
    console.error('Failed to read stored storage locations', err);
  }
  return DEFAULT_STORAGE_LOCATIONS;
}

export function saveStoredStorageLocations(locations: StorageLocation[]): void {
  try {
    localStorage.setItem(STORAGE_LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
  } catch (err) {
    console.error('Failed to save stored storage locations', err);
  }
}

/**
 * Helper to add a sub area to a specific location
 */
export function addSubAreaToLocation(
  locations: StorageLocation[], 
  locationId: string, 
  subAreaName: string
): StorageLocation[] {
  const trimmed = subAreaName.trim();
  if (!trimmed) return locations;

  return locations.map(loc => {
    if (loc.id !== locationId) return loc;
    const existing = loc.subAreas || [];
    if (existing.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return loc;
    }
    return {
      ...loc,
      subAreas: [...existing, trimmed]
    };
  });
}

/**
 * Helper to remove a sub area from a specific location
 */
export function removeSubAreaFromLocation(
  locations: StorageLocation[], 
  locationId: string, 
  subAreaName: string
): StorageLocation[] {
  const trimmed = subAreaName.trim();
  return locations.map(loc => {
    if (loc.id !== locationId) return loc;
    return {
      ...loc,
      subAreas: (loc.subAreas || []).filter(s => s.toLowerCase() !== trimmed.toLowerCase())
    };
  });
}

/**
 * Helper to update a storage location
 */
export function updateStorageLocation(
  locations: StorageLocation[],
  locationId: string,
  updates: {
    name: string;
    zone?: string;
    description?: string;
    subAreas?: string[];
  }
): StorageLocation[] {
  const trimmedName = updates.name.trim();
  if (!trimmedName) return locations;

  return locations.map(loc => {
    if (loc.id !== locationId) return loc;
    return {
      ...loc,
      name: trimmedName,
      zone: updates.zone !== undefined ? updates.zone.trim() || undefined : loc.zone,
      description: updates.description !== undefined ? updates.description.trim() || undefined : loc.description,
      subAreas: updates.subAreas !== undefined ? updates.subAreas : loc.subAreas
    };
  });
}

/**
 * Helper to rename a sub area in a specific location
 */
export function updateSubAreaInLocation(
  locations: StorageLocation[],
  locationId: string,
  oldSubAreaName: string,
  newSubAreaName: string
): StorageLocation[] {
  const trimmedOld = oldSubAreaName.trim().toLowerCase();
  const trimmedNew = newSubAreaName.trim();
  if (!trimmedNew) return locations;

  return locations.map(loc => {
    if (loc.id !== locationId) return loc;
    const currentSubAreas = loc.subAreas || [];
    return {
      ...loc,
      subAreas: currentSubAreas.map(s => s.toLowerCase() === trimmedOld ? trimmedNew : s)
    };
  });
}

