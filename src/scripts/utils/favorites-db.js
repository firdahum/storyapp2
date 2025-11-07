// IndexedDB Helper untuk Favorite Stories
const DB_NAME = 'storyapp-favorites';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

class FavoritesDB {
  constructor() {
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store jika belum ada
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Object store created:', STORE_NAME);
        }
      };
    });
  }

  async addFavorite(story) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const request = objectStore.add(story);

      request.onsuccess = () => {
        console.log('Story added to favorites:', story.id);
        resolve(story);
      };

      request.onerror = () => {
        console.error('Error adding to favorites:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllFavorites() {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error getting favorites:', request.error);
        reject(request.error);
      };
    });
  }

  async getFavorite(id) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteFavorite(id) {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Story removed from favorites:', id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('Error deleting favorite:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteAllFavorites() {
    if (!this.db) await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('All favorites cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing favorites:', request.error);
        reject(request.error);
      };
    });
  }

  async isFavorite(id) {
    const favorite = await this.getFavorite(id);
    return !!favorite;
  }
}

// Export singleton instance
export const favoritesDB = new FavoritesDB();
