
"use client";

import { useMemo, useCallback } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserSettings {
  budget: number;
  reportDay: number;
  multiCurrency: boolean;
  displayName?: string;
  email?: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  budget: 150000,
  reportDay: 1,
  multiCurrency: false
};

/**
 * Hook for managing user profile and settings in Cloud Firestore.
 * Path: users/{userId}
 */
export function useUserSettings() {
  const { user } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: cloudSettings, isLoading } = useDoc<UserSettings>(settingsRef);

  const settings = useMemo(() => {
    if (!cloudSettings) return DEFAULT_SETTINGS;
    return {
      budget: cloudSettings.budget ?? DEFAULT_SETTINGS.budget,
      reportDay: cloudSettings.reportDay ?? DEFAULT_SETTINGS.reportDay,
      multiCurrency: cloudSettings.multiCurrency ?? DEFAULT_SETTINGS.multiCurrency
    };
  }, [cloudSettings]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { 
      ...updates, 
      updatedAt: serverTimestamp(),
      email: user.email,
      displayName: user.displayName 
    }, { merge: true });
  }, [user, db]);

  return {
    settings,
    isLoading,
    updateSettings
  };
}
