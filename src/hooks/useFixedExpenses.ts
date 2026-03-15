
"use client";

import { useState, useEffect, useCallback } from 'react';
import { type FixedExpense, type Expense } from '@/lib/types';
import * as storage from '@/lib/storage';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, setDoc, deleteDoc } from 'firebase/firestore';

export function useFixedExpenses(expenses: Expense[]) {
  const [localFixed, setLocalFixed] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useUser();
  const db = useFirestore();

  const fixedQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'fixedExpenses'));
  }, [db, user?.uid]);

  const { data: cloudFixed, isLoading: isLoadingCloud } = useCollection<FixedExpense>(fixedQuery);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await storage.getFixedExpenses();
        setLocalFixed(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Cloud -> Local Sync
  useEffect(() => {
    if (cloudFixed && user) {
      const sync = async () => {
        for (const cf of cloudFixed) {
          await storage.saveFixedExpense({ ...cf, id: Number(cf.id), synced: true });
        }
        const updated = await storage.getFixedExpenses();
        setLocalFixed(updated);
      };
      sync();
    }
  }, [cloudFixed, user]);

  const addFixedExpense = async (fixed: Omit<FixedExpense, 'id' | 'synced'>) => {
    const id = Date.now();
    const newFixed: FixedExpense = { ...fixed, id, synced: false };
    
    setLocalFixed(prev => [...prev, newFixed]);
    await storage.saveFixedExpense(newFixed);

    if (user && db && navigator.onLine) {
      const docRef = doc(db, 'users', user.uid, 'fixedExpenses', id.toString());
      setDoc(docRef, { ...newFixed, id: id.toString(), synced: true })
        .then(() => storage.saveFixedExpense({ ...newFixed, synced: true }))
        .catch(console.error);
    }
    return newFixed;
  };

  const updateFixedExpense = async (fixed: FixedExpense) => {
    const updated = { ...fixed, synced: false };
    setLocalFixed(prev => prev.map(f => f.id === fixed.id ? updated : f));
    await storage.saveFixedExpense(updated);

    if (user && db && navigator.onLine) {
      const docRef = doc(db, 'users', user.uid, 'fixedExpenses', fixed.id.toString());
      setDoc(docRef, { ...fixed, id: fixed.id.toString(), synced: true })
        .then(() => storage.saveFixedExpense({ ...fixed, synced: true }))
        .catch(console.error);
    }
  };

  const removeFixedExpense = async (id: number) => {
    setLocalFixed(prev => prev.filter(f => f.id !== id));
    await storage.deleteFixedExpense(id);

    if (user && db && navigator.onLine) {
      const docRef = doc(db, 'users', user.uid, 'fixedExpenses', id.toString());
      deleteDoc(docRef).catch(console.error);
    }
  };

  const getPaidStatus = useCallback((fixed: FixedExpense) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.some(e => {
      const ed = new Date(e.date);
      return (
        ed.getMonth() === currentMonth &&
        ed.getFullYear() === currentYear &&
        e.description === fixed.label &&
        e.amount === fixed.amount
      );
    });
  }, [expenses]);

  return {
    fixedExpenses: localFixed,
    isLoading: isLoading || isLoadingCloud,
    addFixedExpense,
    updateFixedExpense,
    removeFixedExpense,
    getPaidStatus
  };
}
