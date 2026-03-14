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

  getItem(key) {
    if (this.isLocalStorageAvailable) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return this.memoryStorage[key] || null;
      }
    }
    return this.memoryStorage[key] || null;
  }

  setItem(key, value) {
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        // Quota exceeded or other error - fallback to memory
        console.warn('localStorage.setItem failed, using in-memory storage:', e);
        this.memoryStorage[key] = value;
        return false;
      }
    }
    this.memoryStorage[key] = value;
    return false;
  }

  removeItem(key) {
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing from localStorage:', e);
      }
    }
    delete this.memoryStorage[key];
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
