/* eslint-disable @typescript-eslint/no-explicit-any */
export const DB_NAME = 'PomodoroDB';
export const DB_VERSION = 2;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('videoProgress')) {
        db.createObjectStore('videoProgress', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveToLocalDB = async (sessionId: string, time: number) => {
  try {
    const db = await openDB();
    const transaction = db.transaction('videoProgress', 'readwrite');
    const store = transaction.objectStore('videoProgress');
    store.put({ id: sessionId, watched_time: time, updatedAt: Date.now() });
  } catch (err) {
    console.error('IndexedDB Save Error:', err);
  }
};

export const getFromLocalDB = async (sessionId: string): Promise<any> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('videoProgress', 'readonly');
      const store = transaction.objectStore('videoProgress');
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

export const getShortMessages = async (): Promise<string[]> => {
  try {
    const db = await openDB(); 
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get('shortMsgs');

      getRequest.onsuccess = () => {
        const msgs = getRequest.result?.value || getRequest.result || [];
        resolve(msgs);
      };

      getRequest.onerror = () => reject('فشل جلب البيانات');
    });
  } catch (err) {
    console.error('Database Open Error:', err);
    throw new Error('فشل فتح قاعدة البيانات');
  }
};