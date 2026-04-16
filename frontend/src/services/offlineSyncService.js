/**
 * Offline Sync Service
 * Purpose: Manage storing failed requests into localStorage 
 * and syncing them when the application comes back online.
 */

const SYNC_QUEUE_KEY = 'rurallearn_sync_queue';

export const saveRequestToQueue = (requestData) => {
  const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)) || [];
  queue.push(requestData);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export const getSyncQueue = () => {
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)) || [];
};

export const clearSyncQueue = () => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

export const syncDependentRequests = async (apiInstance) => {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  console.log(`Starting sync for ${queue.length} items...`);
  
  const failedQueue = [];

  for (const req of queue) {
    try {
      await apiInstance({
        method: req.method,
        url: req.url,
        data: req.data,
      });
      console.log(`Synced: ${req.url}`);
    } catch (error) {
      console.error(`Failed to sync: ${req.url}`, error);
      failedQueue.push(req); // keep in queue if it fails again
    }
  }

  if (failedQueue.length > 0) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedQueue));
  } else {
    clearSyncQueue();
  }
};

// Listen to online events
export const initOfflineSync = (apiInstance) => {
  window.addEventListener('online', () => {
    console.log('App is online. Attempting to sync...');
    syncDependentRequests(apiInstance);
  });
};
