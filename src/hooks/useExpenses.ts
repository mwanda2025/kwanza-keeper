"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { type Expense } from '@/lib/types';
import * as storage from '@/lib/storage';
import { useFirestore, useUser, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, getDocs, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';

const ONBOARDING_KEY = 'kwanzakeeper_onboarded';

export function useExpenses() {
  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  const { user } = useUser();
  const db = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'expenses'), orderBy('date', 'desc'));
  }, [db, user?.uid]);

  const { data: cloudExpenses, isLoading: isLoadingCloud } = useCollection<Expense>(expensesQuery);

  // Load local data and sync status on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await storage.getExpenses();
        setLocalExpenses(data);

        const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
        if (!hasOnboarded && data.length === 0) {
          const seeded = await storage.seedInitialData();
          setLocalExpenses(seeded.sort((a, b) => b.id - a.id));
          localStorage.setItem(ONBOARDING_KEY, 'true');
        }
      } catch (error) {
        console.error("Failed to load local expenses:", error);
      } finally {
        setIsLoadingLocal(false);
      }
    };
    loadData();

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Listen for sync success to update local IndexedDB status
  useEffect(() => {
    const handleSyncSuccess = async (payload: { path: string }) => {
      const parts = payload.path.split('/');
      const id = parts[parts.length - 1];
      if (payload.path.includes('/expenses/')) {
        const expenseId = Number(id);
        const exp = await storage.getExpenses().then(list => list.find(e => e.id === expenseId));
        if (exp && !exp.synced) {
          await storage.updateExpense({ ...exp, synced: true });
          // Refresh local state to reflect synced icon
          const updated = await storage.getExpenses();
          setLocalExpenses(updated);
        }
      }
    };

    errorEmitter.on('sync-success', handleSyncSuccess);
    return () => errorEmitter.off('sync-success', handleSyncSuccess);
  }, []);

  // Sync Cloud -> Local (Two-way sync)
  useEffect(() => {
    if (user && cloudExpenses) {
      const syncToLocal = async () => {
        for (const ce of cloudExpenses) {
          await storage.updateExpense({ ...ce, id: Number(ce.id), synced: true });
        }
        const updated = await storage.getExpenses();
        setLocalExpenses(updated);
      };
      syncToLocal();
    }
  }, [user, cloudExpenses]);

  const expenses = useMemo(() => {
    if (user && cloudExpenses && cloudExpenses.length > 0) {
      return cloudExpenses.map(ce => ({ ...ce, id: Number(ce.id) }));
    }
    return localExpenses;
  }, [user, cloudExpenses, localExpenses]);

  const addExpense = useCallback(async (newExp: Omit<Expense, 'id' | 'synced'>) => {
    const tempId = Date.now();
    const expense: Expense = {
      ...newExp,
      id: tempId,
      synced: false,
      isDemo: false 
    };
    
    // 1. Optimistic Update (Immediate UI)
    setLocalExpenses(prev => [expense, ...prev.filter(e => !e.isDemo)]);
    
    // 2. Persistent Local Storage (Source of Truth)
    await storage.deleteDemoExpenses();
    await storage.addExpense(expense);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    
    // 3. Non-blocking Cloud Sync
    if (user && db && isOnline) {
      const docRef = doc(db, 'users', user.uid, 'expenses', tempId.toString());
      setDocumentNonBlocking(docRef, { ...newExp, id: tempId.toString(), synced: true }, { merge: true });
    }
    
    return expense;
  }, [user, db, isOnline]);

  const removeExpense = useCallback(async (id: number) => {
    setLocalExpenses(prev => prev.filter(e => e.id !== id));
    await storage.deleteExpense(id);
    
    if (user && db && isOnline) {
      const docRef = doc(db, 'users', user.uid, 'expenses', id.toString());
      deleteDocumentNonBlocking(docRef);
    }
  }, [user, db, isOnline]);

  const editExpense = useCallback(async (updatedExp: Expense) => {
    const finalExp = { ...updatedExp, isDemo: false, synced: false };
    const wasDemo = localExpenses.find(e => e.id === updatedExp.id)?.isDemo;

    if (wasDemo) {
      setLocalExpenses(prev => prev.map(e => e.id === updatedExp.id ? finalExp : e).filter(e => !e.isDemo || e.id === updatedExp.id));
      await storage.deleteDemoExpenses();
    } else {
      setLocalExpenses(prev => prev.map(e => e.id === updatedExp.id ? finalExp : e));
    }

    await storage.updateExpense(finalExp);
    
    if (user && db && isOnline) {
      const docRef = doc(db, 'users', user.uid, 'expenses', updatedExp.id.toString());
      updateDocumentNonBlocking(docRef, { ...finalExp, id: updatedExp.id.toString(), synced: true });
    }
  }, [user, db, localExpenses, isOnline]);

  const clearAllData = useCallback(async () => {
    await storage.clearAllLocalExpenses();
    setLocalExpenses([]);
    localStorage.removeItem(ONBOARDING_KEY);

    if (user && db && isOnline) {
      const colRef = collection(db, 'users', user.uid, 'expenses');
      const snapshot = await getDocs(colRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  }, [user, db, isOnline]);

  const seedDemoData = useCallback(async () => {
    const seeded = await storage.seedInitialData();
    setLocalExpenses(prev => [...seeded, ...prev].sort((a, b) => b.id - a.id));
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  return {
    expenses,
    isLoading: isLoadingLocal || (user ? isLoadingCloud : false),
    isOnline,
    addExpense,
    removeExpense,
    editExpense,
    clearAllData,
    seedDemoData
  };
}
