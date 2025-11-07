'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/queryFunctions';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    let firebaseUser = null;
    
    try {
      // Step 1: Firebase authentication
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
      
      // Get Firebase access token
      const accessToken = await firebaseUser.getIdToken();
      
      // Step 2: Backend login API - THIS MUST SUCCEED
      const backendResponse = await loginUser({
        role: "user",
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        access_token: accessToken,
        refresh_token: "",
        profile_details: {
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        }
      });
      
      console.log('Backend login response:', backendResponse);
      toast.success('Successfully signed in!');
      return firebaseUser;
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      // If backend login failed but Firebase succeeded, sign out from Firebase
      if (firebaseUser) {
        try {
          await firebaseSignOut(auth);
          console.log('Firebase signout completed due to backend login failure');
        } catch (signOutError) {
          console.error('Error signing out from Firebase:', signOutError);
        }
      }
      
      // Show appropriate error message
      if (error.name === 'APINotFoundError' || error.message?.includes('CORS')) {
        toast.error('Server connection failed. Please try again later.');
      } else {
        toast.error(error.message || 'Failed to sign in. Please try again.');
      }
      
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    let firebaseUser = null;
    
    try {
      // Step 1: Firebase authentication
      const result = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
      
      // Get Firebase access token
      const accessToken = await firebaseUser.getIdToken();
      
      // Step 2: Backend login API - THIS MUST SUCCEED
      const backendResponse = await loginUser({
        role: "user",
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || email.split('@')[0],
        access_token: accessToken,
        refresh_token: "",
        profile_details: {
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        }
      });
      
      console.log('Backend login response:', backendResponse);
      toast.success('Successfully signed in!');
      return firebaseUser;
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      // If backend login failed but Firebase succeeded, sign out from Firebase
      if (firebaseUser) {
        try {
          await firebaseSignOut(auth);
          console.log('Firebase signout completed due to backend login failure');
        } catch (signOutError) {
          console.error('Error signing out from Firebase:', signOutError);
        }
      }
      
      // Show appropriate error message
      if (error.name === 'APINotFoundError' || error.message?.includes('CORS')) {
        toast.error('Server connection failed. Please try again later.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Invalid password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email.');
      } else {
        toast.error(error.message || 'Failed to sign in. Please try again.');
      }
      
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    let firebaseUser = null;
    
    try {
      // Step 1: Firebase authentication
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
      
      // Get Firebase access token
      const accessToken = await firebaseUser.getIdToken();
      
      // Step 2: Backend login API - THIS MUST SUCCEED
      const backendResponse = await loginUser({
        role: "user",
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: email.split('@')[0],
        access_token: accessToken,
        refresh_token: "",
        profile_details: {
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        }
      });
      
      console.log('Backend login response:', backendResponse);
      toast.success('Account created successfully!');
      return firebaseUser;
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      // If backend login failed but Firebase succeeded, sign out from Firebase
      if (firebaseUser) {
        try {
          await firebaseSignOut(auth);
          console.log('Firebase signout completed due to backend registration failure');
        } catch (signOutError) {
          console.error('Error signing out from Firebase:', signOutError);
        }
      }
      
      // Show appropriate error message
      if (error.name === 'APINotFoundError' || error.message?.includes('CORS')) {
        toast.error('Server connection failed. Please try again later.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

