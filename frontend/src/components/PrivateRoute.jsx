import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { auth } from '../firebase';

const PrivateRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null; // Показать индикатор загрузки, если данные ещё загружаются

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
