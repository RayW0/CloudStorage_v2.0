// src/utils/storageRef.js

import { getStorage, ref } from "firebase/storage";
import { getAuth } from "firebase/auth";

const getStorageReference = async (file) => {
  const storage = getStorage();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Пользователь не авторизован. Пожалуйста, войдите в систему.");
  }

  const userId = currentUser.uid;
  const filePath = `uploads/${userId}/${file.name}`; 
  const storageRef = ref(storage, filePath);  // Создаем ссылку на файл, а не вызываем другую функцию
  
  return { storageRef, filePath };
};

export default getStorageReference;
