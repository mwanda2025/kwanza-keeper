/**
 * Configuração central do Firebase App.
 * Os valores são obtidos do ambiente (.env) para segurança e flexibilidade.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAKZJ7n-t3lGelGhTD1l-GWC-R-HKIk60Y",
  authDomain: "studio-4442152849-95759.firebaseapp.com",
  projectId: "studio-4442152849-95759",
  storageBucket: "studio-4442152849-95759.firebasestorage.app",
  messagingSenderId: "806475950404",
  appId: "1:806475950404:web:a1429f7ecc58f8c87bcf11"
};
