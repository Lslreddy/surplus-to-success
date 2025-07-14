import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';

interface UserProfile {
  id: string;
  full_name: string;
  phone_number?: string;
  user_role: UserRole;
  profile_photo?: string;
  avatar_url?: string;
  provider?: string;
  city?: string;
  state?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // For Google OAuth users, the profile might be created automatically
          // Wait a bit for the trigger to complete
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 1000);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      const profileData: UserProfile = {
        ...data,
        user_role: data.user_role as UserRole
      };

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            user_role: role,
            provider: 'email'
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
      } else if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email and click the confirmation link to complete registration.');
      }

      return { error };
    } catch (error) {
      console.error('Sign up catch error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
      } else {
        toast.success('Successfully signed in!');
      }

      return { error };
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { error };
    }
  };


  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) return { error };

      // Type cast the returned data
      const profileData: UserProfile = {
        ...data,
        user_role: data.user_role as UserRole
      };

      setProfile(profileData);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
