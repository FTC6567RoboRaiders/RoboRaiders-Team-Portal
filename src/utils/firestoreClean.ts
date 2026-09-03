/**
 * Recursively cleans an object for Firestore by removing all `undefined` properties
 * and nested `undefined` values that cause Firestore `setDoc` / `updateDoc` to reject.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (value !== null && typeof value === 'object') {
          cleaned[key] = cleanForFirestore(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned as T;
  }
  return data;
}
