import { auth } from '../firebase';

// Регистрация пользователя
export const register = async (email, password) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  return userCredential.user;
};

// Вход пользователя
export const login = async (email, password) => {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

// Выход пользователя
export const logout = async () => {
  await auth.signOut();
};

// Получение текущего пользователя
export const getCurrentUser = () => {
  return auth.currentUser;
};
