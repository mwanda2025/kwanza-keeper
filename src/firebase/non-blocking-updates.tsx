'use client';
    
import {
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Handles Firestore errors by emitting them to the global error emitter.
 */
function handleFirestoreError(error: any, docRef: DocumentReference, operation: string, data?: any) {
  if (error.code === 'permission-denied') {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: operation as any,
        requestResourceData: data,
      })
    );
  } else {
    // Other errors (network, etc.) are handled as sync errors for the SyncManager to retry later
    errorEmitter.emit('sync-error', { 
      path: docRef.path, 
      operation, 
      error 
    });
  }
}

/**
 * Initiates a setDoc operation. Non-blocking.
 * Does NOT await internally to keep UI snappy.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  setDoc(docRef, data, options || {})
    .then(() => {
      errorEmitter.emit('sync-success', { path: docRef.path, operation: 'set' });
    })
    .catch(error => {
      handleFirestoreError(error, docRef, 'write', data);
    });
}

/**
 * Initiates an updateDoc operation. Non-blocking.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .then(() => {
      errorEmitter.emit('sync-success', { path: docRef.path, operation: 'update' });
    })
    .catch(error => {
      handleFirestoreError(error, docRef, 'update', data);
    });
}

/**
 * Initiates a deleteDoc operation. Non-blocking.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .then(() => {
      errorEmitter.emit('sync-success', { path: docRef.path, operation: 'delete' });
    })
    .catch(error => {
      handleFirestoreError(error, docRef, 'delete');
    });
}
