// hooks/useRegister.js
import { useState, useEffect, useCallback } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import app, { db } from 'firebaseConfig';
import { strengthIndicator } from 'utils/password-strength';
import { strengthColor } from 'utils/password-strength';

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });
        await sendEmailVerification(user);
        console.log('Verification email sent');

        await setDoc(doc(db, 'users', user.uid), {
          displayName,
          email,
          status: 'online',
          role: 'user',
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          groupId: null
        });

        alert('Пожалуйста, проверьте вашу почту и подтвердите свой email для завершения регистрации.');
        await signOut(auth);

        setSubmitting(false);
        navigate('/login');
      } catch (error) {
        console.error('Error registering user:', error);
        setErrors({ submit: error.message });
        setSubmitting(false);
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
