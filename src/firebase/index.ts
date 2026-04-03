'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Inicializa os serviços do Firebase garantindo que a execução ocorre apenas uma vez.
 * Implementa persistência local para manter a sessão do utilizador activa.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    // Verificação de segurança para a API Key em tempo de execução
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "AIzaSyA_SUA_API_KEY_AQUI") {
      console.error('ERRO CRÍTICO: Firebase API Key inválida ou em falta no ficheiro .env.');
    }

    const firebaseApp = initializeApp(firebaseConfig);
    const sdks = getSdks(firebaseApp);
    
    // Configurar persistência local para Auth
    setPersistence(sdks.auth, browserLocalPersistence).catch(err => {
      console.error("Erro ao configurar persistência de Auth:", err);
    });
    
    return sdks;
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
