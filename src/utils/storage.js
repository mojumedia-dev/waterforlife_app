// Storage utility with fallback for localStorage failures
// Handles private browsing mode, quota exceeded, etc.

class Storage {
  constructor() {
    this.memoryStorage = {};
    this.isLocalStorageAvailable = this.checkLocalStorage();
  }

  checkLocalStorage() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available, using in-memory storage. Data will not persist after page refresh.');
      return false;
    }
  }

  // Build user-specific key (email-prefixed)
  getUserKey(key) {
    const userEmail = this.isLocalStorageAvailable ? localStorage.getItem('userEmail') : null;
    // Global keys that shouldn't be user-specific
    if (key === 'userEmail') {
      return key;
    }
    // User-specific keys
    return userEmail ? `${userEmail}_${key}` : key;
  }

  getItem(key) {
    const fullKey = this.getUserKey(key);
    if (this.isLocalStorageAvailable) {
      try {
        return localStorage.getItem(fullKey);
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return this.memoryStorage[fullKey] || null;
      }
    }
    return this.memoryStorage[fullKey] || null;
  }

  setItem(key, value) {
    const fullKey = this.getUserKey(key);
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(fullKey, value);
        return true;
      } catch (e) {
        // Quota exceeded or other error - fallback to memory
        console.warn('localStorage.setItem failed, using in-memory storage:', e);
        this.memoryStorage[fullKey] = value;
        return false;
      }
    }
    this.memoryStorage[fullKey] = value;
    return false;
  }

  removeItem(key) {
    const fullKey = this.getUserKey(key);
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.removeItem(fullKey);
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
    }
    delete this.memoryStorage[fullKey];
  }

  clear() {
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
    }
    this.memoryStorage = {};
  }
}

// Export singleton instance
const storage = new Storage();
export default storage;
