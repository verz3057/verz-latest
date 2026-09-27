import React, {
  createContext,
  useState,
  useContext,
  useEffect
} from 'react';

import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ------------------------------------------------
  // GET USER + PROFILE ROLE
  // ------------------------------------------------
  const getUserWithRole = async (userData) => {
    if (!userData?.id) {
      return userData;
    }

    try {
      const { data: profile, error } =
        await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url, role')
          .eq('id', userData.id)
          .maybeSingle();

      if (error) {
        console.error(
          'PROFILE ROLE FETCH ERROR:',
          error
        );

        return userData;
      }

      return {
        ...userData,
        role: profile?.role || 'customer',
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || ''
      };

    } catch (err) {
      console.error(
        'USER PROFILE ERROR:',
        err
      );

      return userData;
    }
  };

  // ------------------------------------------------
  // RESTORE LOGIN ON PAGE REFRESH
  // ------------------------------------------------
  useEffect(() => {

    const restoreUser = async () => {

      const savedUser =
        localStorage.getItem('user');

      const token =
        localStorage.getItem('token');

      if (savedUser && token) {

        try {

          const parsedUser =
            JSON.parse(savedUser);

          const userWithRole =
            await getUserWithRole(parsedUser);

          localStorage.setItem(
            'user',
            JSON.stringify(userWithRole)
          );

          setUser(userWithRole);

        } catch (err) {

          console.error(
            'RESTORE USER ERROR:',
            err
          );

          localStorage.removeItem('user');
          localStorage.removeItem('token');

        }
      }

      setLoading(false);
    };

    restoreUser();

  }, []);

  // ------------------------------------------------
  // LOGIN
  // ------------------------------------------------
  const login = async (userData, token) => {

    try {

      const userWithRole =
        await getUserWithRole(userData);

      localStorage.setItem(
        'user',
        JSON.stringify(userWithRole)
      );

      localStorage.setItem(
        'token',
        token
      );

      setUser(userWithRole);

      console.log(
        'LOGIN USER WITH ROLE:',
        userWithRole
      );

    } catch (err) {

      console.error(
        'LOGIN ROLE ERROR:',
        err
      );

      // Fallback
      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      );

      localStorage.setItem(
        'token',
        token
      );

      setUser(userData);
    }
  };

  // ------------------------------------------------
  // LOGOUT
  // ------------------------------------------------
  const logout = async () => {

    try {

      await supabase.auth.signOut();

    } catch (err) {

      console.error(
        'LOGOUT ERROR:',
        err
      );

    }

    localStorage.removeItem('user');

    localStorage.removeItem('token');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};