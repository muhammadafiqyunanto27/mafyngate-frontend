/**
 * Safe wrapper for localStorage to prevent crashes in private modes,
 * in-app browsers, and webviews where storage access is blocked.
 */
export const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[Storage] Failed to read '${key}' from localStorage:`, e);
    }
    return null;
  },

  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to write '${key}' to localStorage:`, e);
    }
    return false;
  },

  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to remove '${key}' from localStorage:`, e);
    }
    return false;
  }
};
