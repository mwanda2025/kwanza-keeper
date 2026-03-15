
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, getDocs, query } from 'firebase/firestore';
import * as storage from '@/lib/storage';
import { useExpenses } from './useExpenses';
import { useFixedExpenses } from './useFixedExpenses';
import { useQuickShortcuts } from './useQuickShortcuts';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * @fileOverview Orquestrador central de sincronização (SyncManager).
 * Coordena a ordem de sincronização entre despesas fixas, variáveis e atalhos.
 */
export function useSyncManager() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const { user } = useUser();
  const db = useFirestore();
  
  // Acedemos aos hooks para trigger de refresh se necessário
  const { expenses } = useExpenses();
  const { fixedExpenses } = useFixedExpenses(expenses);
  const { shortcuts, manualShortcuts } = useQuickShortcuts(expenses);

  const performSync = useCallback(async () => {
    if (!user || user.isAnonymous || !db || !navigator.onLine) return;

    setStatus('syncing');
    try {
      const batch = writeBatch(db);
      let operationsCount = 0;

      // 1. Sincronizar Despesas Fixas (Prioridade 1)
      const localFixed = await storage.getFixedExpenses();
      const unsyncedFixed = localFixed.filter(f => !f.synced);
      unsyncedFixed.forEach(f => {
        const ref = doc(db, 'users', user.uid, 'fixedExpenses', f.id.toString());
        batch.set(ref, { ...f, id: f.id.toString(), synced: true });
        operationsCount++;
      });

      // 2. Sincronizar Despesas Variáveis (Prioridade 2)
      const localExpenses = await storage.getExpenses();
      const unsyncedExpenses = localExpenses.filter(e => !e.synced && !e.isDemo);
      unsyncedExpenses.forEach(e => {
        const ref = doc(db, 'users', user.uid, 'expenses', e.id.toString());
        batch.set(ref, { ...e, id: e.id.toString(), synced: true });
        operationsCount++;
      });

      // 3. Sincronizar Atalhos (Prioridade 3)
      const localManual = await storage.getManualShortcuts();
      localManual.forEach((s, i) => {
        const ref = doc(db, 'users', user.uid, 'manualShortcuts', `manual_${i}`);
        batch.set(ref, { ...s, id: `manual_${i}` });
        operationsCount++;
      });

      if (operationsCount > 0) {
        await batch.commit();
        
        // Atualizar status local para 'synced' no IndexedDB
        for (const f of unsyncedFixed) await storage.saveFixedExpense({ ...f, synced: true });
        for (const e of unsyncedExpenses) await storage.updateExpense({ ...e, synced: true });
      }

      setStatus('success');
      setLastSync(new Date());
    } catch (error) {
      console.error("Sync Manager Error:", error);
      setStatus('error');
    }
  }, [user, db]);

  // Monitorizar estado online e disparar sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    if (navigator.onLine) {
      performSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performSync]);

  return {
    status,
    lastSync,
    isOnline,
    forceSync: performSync
  };
}
