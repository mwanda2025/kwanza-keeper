
/**
 * @fileOverview SyncManager (DEPRECATED).
 * The app is now Cloud-Only. Real-time synchronization is handled natively by Firestore.
 */

export function useSyncManager() {
  return {
    status: 'idle' as const,
    lastSync: new Date(),
    isOnline: true,
    forceSync: () => {}
  };
}
