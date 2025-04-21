// app/(public)/_components/(section-3)/_store/utilities/secureStorage.ts
import {
  createJSONStorage,
  StateStorage,
  StorageValue,
} from "zustand/middleware"; // Import types

/**
 * Creates a more secure storage implementation for Zustand persist middleware
 * - Sanitizes data before storing in localStorage
 * - Optionally encrypts sensitive data using a simple obfuscation
 */
// --- Add Generic Type Parameter <T> ---
export const createSecureStorage = <T>() => {
  // Simple obfuscation/de-obfuscation (keep as is)
  const obfuscate = (data: string): string => btoa(encodeURIComponent(data));
  const deobfuscate = (data: string): string => {
    try {
      return decodeURIComponent(atob(data));
    } catch (e) {
      console.error("Failed to deobfuscate data", e);
      return "{}";
    }
  };

  // Create custom storage implementation using StateStorage<T>
  // StateStorage is the underlying type expected by persist
  const secureStorage: StateStorage = {
    // Use the base StateStorage type
    getItem: (name: string): string | Promise<string | null> | null => {
      // console.log(`SecureStorage: Getting item ${name}`);
      const value = localStorage.getItem(name);
      if (value) {
        // Deobfuscate, but return the raw string, persist middleware handles parsing
        return deobfuscate(value);
      }
      return null;
    },
    setItem: (name: string, value: string): void | Promise<void> => {
      // console.log(`SecureStorage: Setting item ${name}`);
      // Value received here is already stringified by persist middleware
      localStorage.setItem(name, obfuscate(value));
    },
    removeItem: (name: string): void | Promise<void> => {
      // console.log(`SecureStorage: Removing item ${name}`);
      localStorage.removeItem(name); // Use removeItem directly
    },
  };

  // --- Return the correctly typed storage engine ---
  // Wrap with createJSONStorage which handles JSON parsing/stringifying
  // *and* expects the base StateStorage type.
  // It will return PersistStorage<T> which is compatible.
  return createJSONStorage<T>(() => secureStorage);
};
// --- End Changes ---

/**
 * Helper function to sanitize product data by removing sensitive fields
 * @param items Array of product items
 * @returns Sanitized array with sensitive data removed
 */
export function sanitizeProductData<T extends { userId?: string }>(
  items: T[],
): Omit<T, "userId">[] {
  // --- Ensure proper filtering for empty/null items if applicable ---
  if (!items) return [];
  return items
    .map((item) => {
      if (!item) return item; // Handle potential null/undefined items in array
      // Create a new object without the userId
      const { userId, ...sanitizedItem } = item;
      return sanitizedItem;
    })
    .filter(Boolean); // Remove any null/undefined entries potentially introduced
}

/**
 * Utility to check if local storage is available and working
 */
export function isLocalStorageAvailable(): boolean {
  // ... (keep existing implementation) ...
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
