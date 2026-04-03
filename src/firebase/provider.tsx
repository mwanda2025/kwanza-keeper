'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Auth, 
  User, 
  onAuthStateChanged, 
  signOut, 
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
      loginWithEmail: async (email, pass) => {
        await signInWithEmailAndPassword(auth, email, pass);
      },
      signupWithEmail: async (name, email, pass) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;
        
        // Update Firebase Auth Profile
        await updateProfile(newUser, { displayName: name });
        
        // Create Firestore User Document
        const userRef = doc(firestore, 'users', newUser.uid);
        await setDoc(userRef, {
          displayName: name,
          email: email,
          uid: newUser.uid,
          budget: 150000,
          reportDay: 1,
          multiCurrency: false,
          createdAt: serverTimestamp()
        }, { merge: true });
      },
      logout: () => signOut(auth),
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider.');
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available.');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useAuth must be used within a FirebaseProvider.');
  return {
    user: context.user,
    loading: context.isUserLoading,
    loginWithEmail: context.loginWithEmail,
    signupWithEmail: context.signupWithEmail,
    logout: context.logout,
    authError: context.userError,
    authService: context.auth
  };
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T & {__memo?: boolean} {
  const memoized = useMemo(factory, deps) as T & {__memo?: boolean};
  if(typeof memoized === 'object' && memoized !== null) {
    memoized.__memo = true;
  }
  return memoized;
}

export const useUser = () => {
  const { user, loading, authError } = useAuth();
  return { user, isUserLoading: loading, userError: authError };
};
