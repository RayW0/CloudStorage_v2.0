// src/utils/GetUserFiles.js

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'firebaseConfig';

/**
 * Функция для получения файлов пользователя с фильтрацией по директории и статусу удаления.
 *
 * @param {string} uid - UID пользователя.
 * @param {string} directory - Текущая директория.
 * @param {boolean} isDeleted - Статус удаления.
 * @returns {Promise<Array>} - Массив файлов.
 */
export const getUserFiles = async (uid, directory, isDeleted = false) => {
  try {
    const q = query(
      collection(db, 'files'),
      where('ownerId', '==', uid),
      where('directory', '==', directory),
      where('isDeleted', '==', isDeleted)
    );
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Добавьте преобразование Timestamp в Date, если необходимо
      deletedAt: doc.data().deletedAt ? doc.data().deletedAt.toDate() : null
    }));
    return files;
  } catch (error) {
    console.error('Ошибка при получении файлов пользователя:', error);
    throw error;
  }
};
