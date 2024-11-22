// hooks/useRegister.js

import { useState, useEffect, useCallback } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { app, db } from 'firebaseConfig';
import { strengthIndicator } from 'utils/password-strength';
import { strengthColor } from 'utils/password-strength';
import { toast } from 'react-toastify';

// Задайте ID группы по умолчанию. Убедитесь, что эта группа существует в вашей коллекции 'groups'.
const DEFAULT_GROUP_ID = 'wc4DvriNonUM91DXo9xO'; // Замените на актуальный ID вашей группы

const useRegister = (navigate) => {
  const auth = getAuth(app);
  const [level, setLevel] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { isEmailVerified: true });
            console.log('Email подтвержден, запись обновлена в Firestore.');
          } catch (error) {
            console.error('Ошибка обновления Firestore после подтверждения email:', error);
            toast.error('Ошибка обновления данных после подтверждения email.');
          }
        }
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleClickShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleMouseDownPassword = useCallback((event) => {
    event.preventDefault();
  }, []);

  const changePassword = useCallback((value, strengthIndicator, strengthColor) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  }, []);

  const registerUser = useCallback(
    async (email, password, displayName, setSubmitting, setErrors) => {
      try {
        // Создание пользователя с email и паролем
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Обновление профиля пользователя с displayName
        await updateProfile(user, { displayName });

        // Отправка email для подтверждения
        await sendEmailVerification(user);
        console.log('Verification email sent');

        // Создание документа пользователя в Firestore
        await setDoc(doc(db, 'users', user.uid), {
          displayName,
          email,
          status: 'online', // Рассмотрите возможность изменения на 'offline' или другой статус по умолчанию
          role: 'user',
          groups: [DEFAULT_GROUP_ID], // Использование ID группы вместо названия
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          profile_pic: '', // Добавьте поле для аватарки, если необходимо
          userbio: '', // Добавьте поле для биографии, если необходимо
          userphone: '', // Добавьте поле для телефона, если необходимо
          isBlocked: false // Поле для статуса блокировки
        });

        // Добавление пользователя в поле members группы
        try {
          const groupRef = doc(db, 'groups', DEFAULT_GROUP_ID);
          const groupSnap = await getDoc(groupRef);
          if (groupSnap.exists()) {
            await updateDoc(groupRef, {
              members: arrayUnion(user.uid)
            });
            console.log(`Пользователь ${user.uid} добавлен в группу ${DEFAULT_GROUP_ID}`);
          } else {
            console.error(`Группа с ID ${DEFAULT_GROUP_ID} не найдена.`);
            toast.error('Группа по умолчанию не найдена. Пожалуйста, свяжитесь с администратором.');
          }
        } catch (groupError) {
          console.error('Ошибка при добавлении пользователя в группу:', groupError);
          toast.error('Ошибка при добавлении пользователя в группу.');
        }

        // Вывод сообщения пользователю
        toast.success('Пожалуйста, проверьте вашу почту и подтвердите свой email для завершения регистрации.');

        // Выход пользователя из системы
        await signOut(auth);

        setSubmitting(false);
        navigate('/login');
      } catch (error) {
        console.error('Error registering user:', error);
        setErrors({ submit: error.message });
        setSubmitting(false);
        toast.error('Ошибка при регистрации пользователя.');
      }
    },
    [auth, navigate]
  );

  useEffect(() => {
    changePassword('', strengthIndicator, strengthColor);
  }, [changePassword]);

  return {
    level,
    showPassword,
    handleClickShowPassword,
    handleMouseDownPassword,
    changePassword,
    registerUser
  };
};

export default useRegister;
