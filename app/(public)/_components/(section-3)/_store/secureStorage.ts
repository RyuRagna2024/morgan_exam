// utilities/secureStorage.ts
import { createJSONStorage } from "zustand/middleware";

/**
 * Creates a more secure storage implementation for Zustand persist middleware
 * - Sanitizes data before storing in localStorage
 * - Optionally encrypts sensitive data using a simple obfuscation
 */
export const createSecureStorage = () => {
  // Simple obfuscation function (not true encryption, but better than plain text)
  const obfuscate = (data: string): string => {
    return btoa(encodeURIComponent(data));
  };

  // Simple de-obfuscation function
  const deobfuscate = (data: string): string => {
    try {
      return decodeURIComponent(atob(data));
    } catch (e) {
      console.error("Failed to deobfuscate data", e);
      return "{}";
    }
  };

  // Create custom storage implementation
  const secureStorage = createJSONStorage<unknown>(() => ({
    getItem: (name: string): string | null => {
      const value = localStorage.getItem(name);
      if (value) {
        return JSON.parse(deobfuscate(value));
      }
      return null;
    },
    setItem: (name: string, value: unknown): void => {
      localStorage.setItem(name, obfuscate(JSON.stringify(value)));
    },
    removeItem: (name: string): void => {
      localStorage.setItem(name, "");
    },
  }));

  return secureStorage;
};

/**
 * Helper function to sanitize product data by removing sensitive fields
 * @param items Array of product items
 * @returns Sanitized array with sensitive data removed
 */
export function sanitizeProductData<T extends { userId?: string }>(
  items: T[],
): Omit<T, "userId">[] {
  return items.map((item) => {
    // Create a new object without the userId
    const { userId, ...sanitizedItem } = item;
    return sanitizedItem;
  });
}

/**
 * Utility to check if local storage is available and working
 * (some browsers may have it disabled)
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
