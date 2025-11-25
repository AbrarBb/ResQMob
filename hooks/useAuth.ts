import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import { User } from '../types';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user: currentUser } = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await AuthService.signUp(email, password, userData);
      
      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('AuthService.signIn called with:', email);
      const { data, error } = await AuthService.signIn(email, password);
      
      console.log('AuthService.signIn result:', { data, error });
      
      if (error) {
        throw error;
      }

      // Update user state
      if (data?.user) {
        setUser(data.user as User);
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      console.log('Sign in error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await AuthService.signOut();
      
      if (error) {
        throw error;
      }

      setUser(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: 'No user logged in' };

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await AuthService.updateUserProfile(user.id, updates);
      
      if (error) {
        throw error;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}