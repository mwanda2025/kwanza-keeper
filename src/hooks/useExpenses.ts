
"use client";

import { useMemo, useCallback } from 'react';
import { type Expense, SAMPLE_EXPENSES } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  deleteDoc, 
  setDoc, 
  writeBatch, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Hook for managing expenses directly in Cloud Firestore.
 * Implements Cloud-Only architecture with real-time updates.
 * Documents are stored in users/{userId}/expenses/{expenseId}.
 */
export function useExpenses() {
  const { user } = useUser();
  const db = useFirestore();

  // Stable query reference for real-time synchronization.
  // Ordering by 'date' (YYYY-MM-DD string) allows efficient range filters.
  const expensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'expenses'), 
      orderBy('date', 'desc')
    );
  }, [db, user?.uid]);

  const { data: cloudExpenses, isLoading } = useCollection<Expense>(expensesQuery);

  const expenses = useMemo(() => {
    // If user is logged in, show their data. Otherwise, show sample data for testing.
    if (!user) return SAMPLE_EXPENSES;
    return cloudExpenses || [];
  }, [cloudExpenses, user]);

  /**
   * Adds a new expense document to the subcollection.
   * Automatically adds createdAt timestamp for server-side audit.
   */
  const addExpense = useCallback(async (newExp: Omit<Expense, 'id'>) => {
    if (!user || !db) {
      throw new Error("Authentication required to save expenses.");
    }
    
    const colRef = collection(db, 'users', user.uid, 'expenses');
    const docRef = await addDoc(colRef, {
      ...newExp,
      createdAt: serverTimestamp() // Required for server-side audit and sorting
    });

    return { ...newExp, id: docRef.id };
  }, [user, db]);

  /**
   * Removes an individual expense document.
   */
  const removeExpense = useCallback(async (id: string) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'expenses', id);
    await deleteDoc(docRef);
  }, [user, db]);

  /**
   * Updates an existing expense document using merge strategy.
   */
  const editExpense = useCallback(async (updatedExp: Expense) => {
    if (!user || !db) return;
    const { id, ...data } = updatedExp;
    const docRef = doc(db, 'users', user.uid, 'expenses', id);
    await setDoc(docRef, { 
      ...data, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, db]);

  /**
   * Bulk deletion of all user expenses using a batch operation.
   */
  const clearAllData = useCallback(async () => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'expenses');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }, [user, db]);

  return {
    expenses,
    isLoading: user ? isLoading : false,
    addExpense,
    removeExpense,
    editExpense,
    clearAllData
  };
}
