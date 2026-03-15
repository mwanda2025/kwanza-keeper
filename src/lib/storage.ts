
import { type Expense, type QuickAdd, type FixedExpense, SAMPLE_EXPENSES, QUICK_ADDS } from './types';

const DB_NAME = 'KwanzaKeeperDB';
const EXPENSES_STORE = 'expenses';
const SHORTCUTS_STORE = 'shortcuts';
const MANUAL_SHORTCUTS_STORE = 'manual_shortcuts';
const FIXED_EXPENSES_STORE = 'fixed_expenses';
const DB_VERSION = 4; // Bumped version for fixed_expenses store

/**
 * Initializes and opens the IndexedDB database.
 */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EXPENSES_STORE)) {
        db.createObjectStore(EXPENSES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SHORTCUTS_STORE)) {
        db.createObjectStore(SHORTCUTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MANUAL_SHORTCUTS_STORE)) {
        db.createObjectStore(MANUAL_SHORTCUTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FIXED_EXPENSES_STORE)) {
        db.createObjectStore(FIXED_EXPENSES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all expenses from local storage.
 */
export async function getExpenses(): Promise<Expense[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXPENSES_STORE, 'readonly');
    const store = transaction.objectStore(EXPENSES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as Expense[];
      resolve(results.sort((a, b) => b.id - a.id));
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Seeds the database with sample data without deleting existing ones.
 */
export async function seedInitialData(): Promise<Expense[]> {
  const db = await openDB();
  const transaction = db.transaction(EXPENSES_STORE, 'readwrite');
  const store = transaction.objectStore(EXPENSES_STORE);
  
  const now = Date.now();
  const seededExpenses: Expense[] = SAMPLE_EXPENSES.map((expense, index) => ({
    ...expense,
    id: now + index,
    isDemo: true,
  })) as Expense[];

  seededExpenses.forEach(expense => store.add(expense));
  
  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve(seededExpenses);
  });
}

/**
 * Adds a new expense to local storage.
 */
export async function addExpense(expense: Expense): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXPENSES_STORE, 'readwrite');
    const store = transaction.objectStore(EXPENSES_STORE);
    const request = store.add(expense);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Updates an existing expense in local storage.
 */
export async function updateExpense(expense: Expense): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXPENSES_STORE, 'readwrite');
    const store = transaction.objectStore(EXPENSES_STORE);
    const request = store.put(expense);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes an expense from local storage.
 */
export async function deleteExpense(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXPENSES_STORE, 'readwrite');
    const store = transaction.objectStore(EXPENSES_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clears all local expenses.
 */
export async function clearAllLocalExpenses(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EXPENSES_STORE, 'readwrite');
    const store = transaction.objectStore(EXPENSES_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes all expenses marked as demo data.
 */
export async function deleteDemoExpenses(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(EXPENSES_STORE, 'readwrite');
  const store = transaction.objectStore(EXPENSES_STORE);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const all = request.result as Expense[];
      const demoIds = all.filter(e => e.isDemo).map(e => e.id);
      demoIds.forEach(id => store.delete(id));
      resolve();
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// --- SHORTCUTS PERSISTENCE ---

export async function getLocalShortcuts(): Promise<QuickAdd[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SHORTCUTS_STORE, 'readonly');
    const store = transaction.objectStore(SHORTCUTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as (QuickAdd & { id: string })[];
      if (results.length === 0) return resolve([]);
      resolve(results.sort((a, b) => a.id.localeCompare(b.id)).map(({ id, ...rest }) => rest));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalShortcuts(shortcuts: QuickAdd[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SHORTCUTS_STORE, 'readwrite');
    const store = transaction.objectStore(SHORTCUTS_STORE);
    store.clear();
    shortcuts.forEach((s, i) => {
      store.add({ ...s, id: `shortcut_${i}` });
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// --- MANUAL SHORTCUTS PERSISTENCE ---

export async function getManualShortcuts(): Promise<QuickAdd[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MANUAL_SHORTCUTS_STORE, 'readonly');
    const store = transaction.objectStore(MANUAL_SHORTCUTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as (QuickAdd & { id: string })[];
      resolve(results.sort((a, b) => a.id.localeCompare(b.id)).map(({ id, ...rest }) => rest));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveManualShortcuts(shortcuts: QuickAdd[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MANUAL_SHORTCUTS_STORE, 'readwrite');
    const store = transaction.objectStore(MANUAL_SHORTCUTS_STORE);
    store.clear();
    shortcuts.forEach((s, i) => {
      store.add({ ...s, id: `manual_${i}` });
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// --- FIXED EXPENSES PERSISTENCE ---

export async function getFixedExpenses(): Promise<FixedExpense[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FIXED_EXPENSES_STORE, 'readonly');
    const store = transaction.objectStore(FIXED_EXPENSES_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as FixedExpense[]);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFixedExpense(fixed: FixedExpense): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FIXED_EXPENSES_STORE, 'readwrite');
    const store = transaction.objectStore(FIXED_EXPENSES_STORE);
    const request = store.put(fixed);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFixedExpense(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FIXED_EXPENSES_STORE, 'readwrite');
    const store = transaction.objectStore(FIXED_EXPENSES_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
