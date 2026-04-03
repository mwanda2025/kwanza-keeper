
"use client";

import { useMemo, useCallback } from 'react';
import { type FixedExpense, type Expense } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Hook for managing recurring fixed expenses in Cloud Firestore.
 */
export function useFixedExpenses(expenses: Expense[]) {
  const { user } = useUser();
  const db = useFirestore();

  const fixedQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'fixed-expenses'));
  }, [db, user?.uid]);

  const { data: cloudFixed, isLoading } = useCollection<FixedExpense>(fixedQuery);

  const fixedExpenses = useMemo(() => {
    return cloudFixed || [];
  }, [cloudFixed]);

  const addFixedExpense = async (fixed: Omit<FixedExpense, 'id' | 'synced'>) => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'fixed-expenses');
    const docRef = await addDoc(colRef, {
      ...fixed,
      createdAt: serverTimestamp()
    });
    return { ...fixed, id: docRef.id };
  };

  const updateFixedExpense = async (fixed: FixedExpense) => {
    if (!user || !db) return;
    const { id, ...data } = fixed;
    const docRef = doc(db, 'users', user.uid, 'fixed-expenses', id.toString());
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  };

  const removeFixedExpense = async (id: string | number) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'fixed-expenses', id.toString());
    await deleteDoc(docRef);
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
        e.description.toLowerCase() === fixed.label.toLowerCase() &&
        (e.baseAmount || e.amount) === fixed.amount
      );
    });
  }, [expenses]);

  return {
    fixedExpenses,
    isLoading,
    addFixedExpense,
    updateFixedExpense,
    removeFixedExpense,
    getPaidStatus
  };
}
