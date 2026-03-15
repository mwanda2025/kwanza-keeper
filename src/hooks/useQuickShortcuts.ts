
"use client";

import { useState, useEffect, useMemo } from 'react';
import { type QuickAdd, type Expense, QUICK_ADDS } from '@/lib/types';
import * as storage from '@/lib/storage';
import { getSmartQuickAdds } from '@/lib/quickAccessEngine';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, writeBatch } from 'firebase/firestore';

export function useQuickShortcuts(expenses: Expense[]) {
  const [smartShortcuts, setSmartShortcuts] = useState<QuickAdd[]>([]);
  const [manualShortcuts, setManualShortcuts] = useState<QuickAdd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useUser();
  const db = useFirestore();

  const smartShortcutsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'quickAddShortcuts'));
  }, [db, user?.uid]);

  const manualShortcutsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'manualShortcuts'));
  }, [db, user?.uid]);

  const { data: cloudSmartShortcuts } = useCollection<QuickAdd & { id: string }>(smartShortcutsQuery);
  const { data: cloudManualShortcuts } = useCollection<QuickAdd & { id: string }>(manualShortcutsQuery);

  useEffect(() => {
    const loadLocal = async () => {
      try {
        const localSmart = await storage.getLocalShortcuts();
        const localManual = await storage.getManualShortcuts();
        setSmartShortcuts(localSmart.length > 0 ? localSmart : QUICK_ADDS);
        setManualShortcuts(localManual);
      } catch (e) {
        console.error("Error loading shortcuts:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadLocal();
  }, []);

  // Adaptative learning
  useEffect(() => {
    if (expenses.length > 0) {
      const learned = getSmartQuickAdds(expenses);
      const hasChanged = JSON.stringify(learned) !== JSON.stringify(smartShortcuts);
      
      if (hasChanged) {
        setSmartShortcuts(learned);
        storage.saveLocalShortcuts(learned);
      }
    }
  }, [expenses, smartShortcuts]);

  // Sync Cloud -> Local
  useEffect(() => {
    if (cloudManualShortcuts && cloudManualShortcuts.length > 0) {
      const cloudMapped = cloudManualShortcuts
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(({ id, ...rest }) => rest);
      
      if (JSON.stringify(cloudMapped) !== JSON.stringify(manualShortcuts)) {
        setManualShortcuts(cloudMapped);
        storage.saveManualShortcuts(cloudMapped);
      }
    }
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
    setManualShortcuts(newManual);
    await storage.saveManualShortcuts(newManual);
    
    if (user && db && navigator.onLine) {
      const batch = writeBatch(db);
      newManual.forEach((s, i) => {
        const docRef = doc(db, 'users', user.uid, 'manualShortcuts', `manual_${i}`);
        batch.set(docRef, { ...s, id: `manual_${i}` });
      });
      await batch.commit();
    }
  };

  return { shortcuts, manualShortcuts, isLoading, updateManualShortcuts };
}
