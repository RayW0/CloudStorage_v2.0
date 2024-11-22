// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [customClaims, setCustomClaims] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Принудительное обновление токена для получения последних customClaims
          const tokenResult = await getIdTokenResult(user, true);
          setCustomClaims(tokenResult.claims);
          console.log('Custom Claims обновлены:', tokenResult.claims);
        } catch (error) {
          console.error('Ошибка при получении customClaims:', error);
          setCustomClaims({});
        }
      } else {
        setCustomClaims({});
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    customClaims,
    isLoading
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
}
