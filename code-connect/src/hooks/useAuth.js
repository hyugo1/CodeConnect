// src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

/**
 * Custom hook to handle Firebase authentication.
 * Extracts auth logic from Navbar component for better separation of concerns.
 * 
 * @returns {Object} - Contains auth state and handler functions
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email, password) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    setError(null);
    if (!email.trim() || !password) {
      throw new Error('Please fill in your email and password.');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign out
  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Send password reset email
  const resetPassword = useCallback(async (email) => {
    setError(null);
    if (!email.trim()) {
      throw new Error('Please type your email address.');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete user account
  const deleteAccount = useCallback(async () => {
    setError(null);
    if (!currentUser) {
      throw new Error('No user signed in.');
    }
    try {
      await deleteUser(currentUser);
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  return {
    currentUser,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: signOutUser,
    resetPassword,
    deleteAccount,
  };
}

export default useAuth;