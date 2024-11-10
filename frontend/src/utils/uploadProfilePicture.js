// src/utils/uploadProfilePicture.js

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "firebaseConfig";

const uploadProfilePicture = async (userId, file) => {
  const storage = getStorage();
  const filePath = `profile_pics/${userId}/${file.name}`; // Путь к файлу
  const storageRef = ref(storage, filePath);

  // Загрузка файла в Storage
  await uploadBytes(storageRef, file);
  // Получение ссылки для доступа к файлу  
  const URL = await getDownloadURL(storageRef);

  const userRef = doc(db, "users", userId); // Ссылка на документ пользователя

  await setDoc(userRef, { profile_pic: URL }, { merge: true });

  return URL;
};

export default uploadProfilePicture;
