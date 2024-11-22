// src/hooks/useUserProfile.js

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { toast } from 'react-toastify';

export default function useUserProfile() {
  const [userName, setUserName] = useState('Гость');
  const [userEmail, setUserEmail] = useState('');
  const [userStatus, setUserStatus] = useState('Не в сети');
  const [userRole, setUserRole] = useState('Гость');
  const [userPosition, setUserPosition] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [userGroupIds, setUserGroupIds] = useState([]); // Массив ID групп
  const [userGroups, setUserGroups] = useState([]); // Массив объектов групп
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'Гость');
        setUserEmail(user.email || '');

        // Получение кастомных утверждений для роли
        user
          .getIdTokenResult(true)
          .then((idTokenResult) => {
            setUserRole(idTokenResult.claims.admin ? 'admin' : 'user');
          })
          .catch((error) => {
            console.error('Ошибка при получении ID токена:', error);
          });

        // Подписка на документ пользователя для реального времени
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(
          userDocRef,
          async (userDoc) => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserPosition(userData.position || 'не указано');
              setProfilePic(userData.profile_pic || '');
              setUserBio(userData.userbio || '');
              setUserPhone(userData.userphone || '');
              setIsBlocked(userData.isBlocked || false);
              setUserGroupIds(userData.groups || []); // Устанавливаем массив групп
              setUserStatus(userData.status || 'online');

              console.log('userData.groups:', userData.groups);

              if (Array.isArray(userData.groups) && userData.groups.length > 0) {
                // Получаем данные всех групп пользователя
                const groupPromises = userData.groups.map(async (groupId) => {
                  const groupDocRef = doc(db, 'groups', groupId);
                  const groupDoc = await getDoc(groupDocRef);
                  if (groupDoc.exists()) {
                    const groupData = groupDoc.data();
                    return { id: groupDoc.id, name: groupData.name || 'Неизвестная группа' };
                  } else {
                    console.error(`Группа с ID ${groupId} не найдена`);
                    return { id: groupId, name: 'Неизвестная группа' };
                  }
                });

                try {
                  const groupsData = await Promise.all(groupPromises);
                  setUserGroups(groupsData);
                  console.log('userGroups:', groupsData);
                } catch (error) {
                  console.error('Ошибка при загрузке групп пользователя:', error);
                  toast.error('Ошибка при загрузке групп пользователя');
                  setUserGroups([]);
                }
              } else {
                setUserGroups([]);
              }
            } else {
              // Если документ пользователя не найден, сбросить состояния
              setUserPosition('');
              setProfilePic('');
              setUserBio('');
              setUserPhone('');
              setIsBlocked(false);
              setUserGroupIds([]);
              setUserGroups([]);
              setUserStatus('Не в сети');
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('Ошибка при получении данных пользователя:', error);
            toast.error('Ошибка при получении данных пользователя');
            setIsLoading(false);
          }
        );

        // Очистка подписки при размонтировании
        return () => unsubscribeUser();
      } else {
        // Если пользователь не аутентифицирован, сбросить все состояния
        setUserName('Гость');
        setUserEmail('');
        setUserRole('Гость');
        setUserPosition('');
        setProfilePic('');
        setUserBio('');
        setUserPhone('');
        setIsBlocked(false);
        setUserGroupIds([]);
        setUserGroups([]);
        setUserStatus('Не в сети');
        setIsLoading(false);
      }
    });

    // Очистка подписки аутентификации при размонтировании
    return () => unsubscribeAuth();
  }, []);

  return {
    userName,
    userEmail,
    userStatus,
    userRole,
    userPosition,
    profilePic,
    userBio,
    userPhone,
    isBlocked,
    userGroupIds, // Массив ID групп
    userGroups, // Массив объектов групп
    isLoading
  };
}
