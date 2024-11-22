// src/components/CheckAdmin.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainCard from './MainCard';

function CheckAdmin() {
  const { currentUser, customClaims, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log('Текущий пользователь:', currentUser);
      console.log('Custom Claims:', customClaims);
    }
  }, [currentUser, customClaims, isLoading]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <MainCard>
      <div>
        <h2>Проверка прав администратора</h2>
        <p>Пользователь: {currentUser ? currentUser.email : 'Не аутентифицирован'}</p>
        <p>Администратор: {customClaims.admin ? 'Да' : 'Нет'}</p>
      </div>
    </MainCard>
  );
}

export default CheckAdmin;
