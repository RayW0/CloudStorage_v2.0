// utils/GetUserFolders.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'firebaseConfig';

// Функция для получения списка папок пользователя
export const getUserFolders = async (userId) => {
  try {
    // Определяем коллекцию "folders" и создаем запрос для папок текущего пользователя
    const q = query(collection(db, 'folders'), where('ownerId', '==', userId));
    
    // Выполняем запрос
    const querySnapshot = await getDocs(q);

    // Создаем массив объектов папок на основе полученных документов
    const folders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return folders;
  } catch (error) {
    console.error("Ошибка при получении папок пользователя:", error);
    return [];
  }
};
