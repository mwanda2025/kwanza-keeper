
"use client";

import { useMemo } from 'react';
import { type QuickAdd, type Expense, QUICK_ADDS } from '@/lib/types';
import { getSmartQuickAdds } from '@/lib/quickAccessEngine';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, writeBatch } from 'firebase/firestore';

export function useQuickShortcuts(expenses: Expense[]) {
  const { user } = useUser();
  const db = useFirestore();

  const manualShortcutsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    // Updated path to kebab-case: manual-shortcuts
    return query(collection(db, 'users', user.uid, 'manual-shortcuts'));
  }, [db, user?.uid]);

  const { data: cloudManualShortcuts, isLoading } = useCollection<QuickAdd & { id: string }>(manualShortcutsQuery);

  const smartShortcuts = useMemo(() => {
    return getSmartQuickAdds(expenses);
  }, [expenses]);

  const manualShortcuts = useMemo(() => {
    if (!cloudManualShortcuts) return [];
    return cloudManualShortcuts
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(({ id, ...rest }) => rest);
  }, [cloudManualShortcuts]);

  const shortcuts = useMemo(() => {
    const combined: QuickAdd[] = [...manualShortcuts.slice(0, 3)];
    const filteredSmart = smartShortcuts.filter(s => 
      !combined.some(m => m.label.toLowerCase() === s.label.toLowerCase() && m.amount === s.amount)
    );
    combined.push(...filteredSmart.slice(0, 6 - combined.length));
    return combined.slice(0, 6);
  }, [manualShortcuts, smartShortcuts]);

  const updateManualShortcuts = async (newManual: QuickAdd[]) => {
    if (!user || !db) return;
    const batch = writeBatch(db);
    
    // Path updated to manual-shortcuts
    newManual.forEach((s, i) => {
      const docRef = doc(db, 'users', user.uid, 'manual-shortcuts', `manual_${i}`);
      batch.set(docRef, { ...s, id: `manual_${i}` });
    });
    
    await batch.commit();
  };

  return { shortcuts, manualShortcuts, isLoading, updateManualShortcuts };
}
