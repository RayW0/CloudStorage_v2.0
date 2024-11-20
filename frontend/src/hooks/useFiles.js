// src/hooks/useFiles.js

import { useState, useEffect, useCallback } from 'react';
import { doc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';

const useFiles = (currentDirectory = '/') => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [groupId, setGroupId] = useState(null);

  // Слушатель аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserGroupId(user.uid);
        await fetchFolders();
        await fetchFiles();
      } else {
        setCurrentUser(null);
        setGroupId(null);
        setFolders([]);
        setFiles([]);
      }
    });

    return () => unsubscribe();
  }, [currentDirectory, groupId, currentDirectory]);

  // Получение groupId пользователя
  const fetchUserGroupId = useCallback(async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setGroupId(userData.groupId || null);
      } else {
        console.error('Документ пользователя не найден');
        setGroupId(null);
      }
    } catch (error) {
      console.error('Ошибка при получении groupId пользователя:', error);
      setGroupId(null);
    }
  }, []);

  // Получение папок
  const fetchFolders = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const currentPath = currentDirectory || '/';

      const folderQueries = [
        query(
          collection(db, 'folders'),
          where('directory', '==', currentPath),
          where('isDeleted', '==', false),
          where('ownerId', '==', currentUser.uid)
        )
      ];

      if (groupId) {
        folderQueries.push(
          query(
            collection(db, 'folders'),
            where('directory', '==', currentPath),
            where('isDeleted', '==', false),
            where('groupId', '==', groupId)
          )
        );
      }

      const querySnapshots = await Promise.all(folderQueries.map((q) => getDocs(q)));
      const fetchedFolders = [];
      querySnapshots.forEach((snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedFolders.push({ id: docSnap.id, type: 'folder', ...data });
        });
      });

      setFolders(fetchedFolders);
    } catch (error) {
      console.error('Ошибка при получении папок:', error);
      toast.error(`Не удалось получить папки: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, groupId, currentDirectory]);

  // Получение файлов
  const fetchFiles = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const currentPath = currentDirectory || '/';

      const fileQueries = [
        query(
          collection(db, 'files'),
          where('directory', '==', currentPath),
          where('isDeleted', '==', false),
          where('ownerId', '==', currentUser.uid)
        )
      ];

      if (groupId) {
        fileQueries.push(
          query(
            collection(db, 'files'),
            where('directory', '==', currentPath),
            where('isDeleted', '==', false),
            where('groupId', '==', groupId)
          )
        );
      }

      const querySnapshots = await Promise.all(fileQueries.map((q) => getDocs(q)));
      const fetchedFiles = [];
      querySnapshots.forEach((snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedFiles.push({ id: docSnap.id, type: 'file', ...data });
        });
      });

      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Ошибка при получении файлов:', error);
      toast.error(`Не удалось получить файлы: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, groupId, currentDirectory]);

  // Создание папки
  const handleCreateFolder = useCallback(
    async (folderName, directory) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      setIsLoading(true);
      try {
        const newFolder = {
          name: folderName,
          ownerId: currentUser.uid,
          directory: directory || '/',
          folderPath: directory === '/' ? `/${folderName}/` : `${directory}${folderName}/`,
          createdAt: Date.now(),
          isDeleted: false,
          deletedAt: null,
          groupId: null, // Изначально папка приватная
          type: 'folder'
        };

        const docRef = await addDoc(collection(db, 'folders'), newFolder);
        setFolders((prevFolders) => [...prevFolders, { id: docRef.id, ...newFolder }]);
        toast.success(`Папка "${folderName}" успешно создана`);
      } catch (error) {
        console.error('Ошибка при создании папки:', error);
        toast.error(`Не удалось создать папку: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Загрузка файла
  const handleUploadFile = useCallback(
    async (file, directory) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      setIsLoading(true);
      try {
        const storageRef = ref(storage, `${directory}${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const newFile = {
          name: file.name,
          size: file.size,
          last_modified: Date.now(),
          ownerId: currentUser.uid,
          downloadURL,
          path: `${directory}${file.name}`,
          directory: directory || '/',
          isDeleted: false,
          deletedAt: null,
          type: 'file',
          groupId: null // Изначально файл приватный
        };

        const docRef = await addDoc(collection(db, 'files'), newFile);
        setFiles((prevFiles) => [...prevFiles, { id: docRef.id, ...newFile }]);
        toast.success('Файл успешно загружен!');
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        toast.error(`Не удалось загрузить файл: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Удаление файлов (перемещение в корзину)
  const handleDeleteFiles = useCallback(
    async (fileIds) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        toast.warn('Не выбрано ни одного файла для удаления');
        return;
      }

      setIsLoading(true);
      try {
        const invalidIds = fileIds.filter((id) => typeof id !== 'string' || !id);
        if (invalidIds.length > 0) {
          console.error('Некорректные ID файлов:', invalidIds);
          toast.error('Некоторые файлы имеют некорректные идентификаторы');
          return;
        }

        await Promise.all(
          fileIds.map(async (fileId) => {
            const fileRef = doc(db, 'files', fileId);
            const fileDoc = await getDoc(fileRef);

            if (fileDoc.exists()) {
              // Обновляем поля isDeleted и deletedAt
              await updateDoc(fileRef, {
                isDeleted: true,
                deletedAt: Date.now()
              });
            } else {
              console.warn(`Файл с ID ${fileId} не найден`);
            }
          })
        );

        // Обновляем локальное состояние
        setFiles((prevFiles) => prevFiles.filter((f) => !fileIds.includes(f.id)));
        toast.success('Файлы успешно перемещены в корзину');
      } catch (error) {
        console.error('Ошибка при удалении файлов:', error);
        toast.error(`Не удалось удалить файлы: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Удаление папок (перемещение в корзину)
  const handleDeleteFolders = useCallback(
    async (folderIds) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      if (!Array.isArray(folderIds) || folderIds.length === 0) {
        toast.warn('Не выбрано ни одной папки для удаления');
        return;
      }

      setIsLoading(true);
      try {
        const invalidIds = folderIds.filter((id) => typeof id !== 'string' || !id);
        if (invalidIds.length > 0) {
          console.error('Некорректные ID папок:', invalidIds);
          toast.error('Некоторые папки имеют некорректные идентификаторы');
          return;
        }

        await Promise.all(
          folderIds.map(async (folderId) => {
            const folderRef = doc(db, 'folders', folderId);
            const folderDoc = await getDoc(folderRef);

            if (folderDoc.exists()) {
              const folderData = folderDoc.data();

              // Помечаем папку и её содержимое как удалённые
              await markFolderAsDeleted(folderData.folderPath);

              // Обновляем саму папку
              await updateDoc(folderRef, {
                isDeleted: true,
                deletedAt: Date.now()
              });
            } else {
              console.warn(`Папка с ID ${folderId} не найдена`);
            }
          })
        );

        // Обновляем локальное состояние
        setFolders((prevFolders) => prevFolders.filter((f) => !folderIds.includes(f.id)));
        toast.success('Папки успешно перемещены в корзину');
      } catch (error) {
        console.error('Ошибка при удалении папок:', error);
        toast.error(`Не удалось удалить папки: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Рекурсивное помечение содержимого папки как удалённого
  const markFolderAsDeleted = useCallback(async (folderPath) => {
    try {
      // Помечаем вложенные файлы как удалённые
      const filesQuery = query(collection(db, 'files'), where('directory', '==', folderPath), where('isDeleted', '==', false));
      const filesSnapshot = await getDocs(filesQuery);

      const fileUpdatePromises = filesSnapshot.docs.map(async (fileDoc) => {
        await updateDoc(fileDoc.ref, {
          isDeleted: true,
          deletedAt: Date.now()
        });
      });

      // Помечаем вложенные папки как удалённые
      const foldersQuery = query(collection(db, 'folders'), where('directory', '==', folderPath), where('isDeleted', '==', false));
      const foldersSnapshot = await getDocs(foldersQuery);

      const folderUpdatePromises = foldersSnapshot.docs.map(async (folderDoc) => {
        const folderData = folderDoc.data();
        await markFolderAsDeleted(folderData.folderPath);
        await updateDoc(folderDoc.ref, {
          isDeleted: true,
          deletedAt: Date.now()
        });
      });

      await Promise.all([...fileUpdatePromises, ...folderUpdatePromises]);
    } catch (error) {
      console.error('Ошибка при пометке содержимого папки как удалённого:', error);
      throw error;
    }
  }, []);

  // Восстановление файлов из корзины
  const handleRestoreFile = useCallback(
    async (fileId) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      setIsLoading(true);
      try {
        const fileRef = doc(db, 'files', fileId);
        await updateDoc(fileRef, {
          isDeleted: false,
          deletedAt: null
        });

        // Получаем обновленные данные файла
        const fileDoc = await getDoc(fileRef);
        if (fileDoc.exists()) {
          const fileData = fileDoc.data();
          // Проверяем, находится ли файл в текущей директории
          if (fileData.directory === currentDirectory) {
            setFiles((prevFiles) => [...prevFiles, { id: fileDoc.id, type: 'file', ...fileData }]);
          }
        }

        // Обновляем список файлов, чтобы гарантировать актуальность данных
        await fetchFiles();

        toast.success('Файл успешно восстановлен');
      } catch (error) {
        console.error('Ошибка при восстановлении файла:', error);
        toast.error(`Не удалось восстановить файл: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, currentDirectory, fetchFiles]
  );

  // Окончательное удаление файла из корзины
  const handlePermanentDeleteFile = useCallback(
    async (fileId) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      setIsLoading(true);
      try {
        const fileRef = doc(db, 'files', fileId);
        const fileDoc = await getDoc(fileRef);

        if (fileDoc.exists()) {
          const fileData = fileDoc.data();
          if (fileData.path) {
            const storageRef = ref(storage, fileData.path);
            await deleteObject(storageRef);
          }
          await deleteDoc(fileRef);
        } else {
          console.warn(`Файл с ID ${fileId} не найден`);
        }

        // Обновляем локальное состояние
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
        toast.success('Файл окончательно удалён');
      } catch (error) {
        console.error('Ошибка при окончательном удалении файла:', error);
        toast.error(`Не удалось окончательно удалить файл: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Восстановление папки из корзины
  const handleRestoreFolder = useCallback(
    async (folderId) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      setIsLoading(true);
      try {
        const folderRef = doc(db, 'folders', folderId);
        await updateDoc(folderRef, {
          isDeleted: false,
          deletedAt: null
        });

        // Восстанавливаем содержимое папки
        await restoreFolderContents(folderRef);

        // Обновляем список папок и файлов
        await fetchFolders();
        await fetchFiles();

        toast.success('Папка успешно восстановлена');
      } catch (error) {
        console.error('Ошибка при восстановлении папки:', error);
        toast.error(`Не удалось восстановить папку: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, fetchFolders, fetchFiles]
  );

  // Рекурсивное восстановление содержимого папки
  const restoreFolderContents = useCallback(async (folderRef) => {
    try {
      const folderDoc = await getDoc(folderRef);
      if (!folderDoc.exists()) return;
      const folderData = folderDoc.data();

      // Восстанавливаем вложенные файлы
      const filesQuery = query(collection(db, 'files'), where('directory', '==', folderData.folderPath), where('isDeleted', '==', true));
      const filesSnapshot = await getDocs(filesQuery);

      const fileUpdatePromises = filesSnapshot.docs.map(async (fileDoc) => {
        await updateDoc(fileDoc.ref, {
          isDeleted: false,
          deletedAt: null
        });
      });

      // Восстанавливаем вложенные папки
      const foldersQuery = query(
        collection(db, 'folders'),
        where('directory', '==', folderData.folderPath),
        where('isDeleted', '==', true)
      );
      const foldersSnapshot = await getDocs(foldersQuery);

      const folderUpdatePromises = foldersSnapshot.docs.map(async (childFolderDoc) => {
        await updateDoc(childFolderDoc.ref, {
          isDeleted: false,
          deletedAt: null
        });
        // Рекурсивно восстанавливаем содержимое вложенных папок
        await restoreFolderContents(childFolderDoc.ref);
      });

      await Promise.all([...fileUpdatePromises, ...folderUpdatePromises]);
    } catch (error) {
      console.error('Ошибка при восстановлении содержимого папки:', error);
      throw error;
    }
  }, []);

  // Окончательное удаление папки из корзины
  const handlePermanentDeleteFolder = useCallback(
    async (folderId) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      setIsLoading(true);
      try {
        const folderRef = doc(db, 'folders', folderId);
        const folderDoc = await getDoc(folderRef);

        if (folderDoc.exists()) {
          const folderData = folderDoc.data();

          // Удаление содержимого папки
          await deleteFolderContentsFinal(folderData.folderPath);

          // Удаление самой папки
          await deleteDoc(folderRef);
        } else {
          console.warn(`Папка с ID ${folderId} не найдена`);
        }

        // Обновляем локальное состояние
        setFolders((prevFolders) => prevFolders.filter((f) => f.id !== folderId));
        toast.success('Папка окончательно удалена');
      } catch (error) {
        console.error('Ошибка при окончательном удалении папки:', error);
        toast.error(`Не удалось окончательно удалить папку: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Рекурсивное окончательное удаление содержимого папки
  const deleteFolderContentsFinal = useCallback(async (folderPath) => {
    try {
      // Удаление вложенных файлов
      const filesQuery = query(collection(db, 'files'), where('directory', '==', folderPath), where('isDeleted', '==', true));
      const filesSnapshot = await getDocs(filesQuery);

      const fileDeletePromises = filesSnapshot.docs.map(async (fileDoc) => {
        const fileData = fileDoc.data();
        if (fileData.path) {
          const fileRef = ref(storage, fileData.path);
          await deleteObject(fileRef);
        }
        await deleteDoc(fileDoc.ref);
      });

      // Удаление вложенных папок
      const foldersQuery = query(collection(db, 'folders'), where('directory', '==', folderPath), where('isDeleted', '==', true));
      const foldersSnapshot = await getDocs(foldersQuery);

      const folderDeletePromises = foldersSnapshot.docs.map(async (folderDoc) => {
        const folderData = folderDoc.data();
        await deleteFolderContentsFinal(folderData.folderPath);
        await deleteDoc(folderDoc.ref);
      });

      await Promise.all([...fileDeletePromises, ...folderDeletePromises]);
    } catch (error) {
      console.error('Ошибка при окончательном удалении содержимого папки:', error);
      throw error;
    }
  }, []);

  // Совместное использование папки с группой
  const handleShareFolderToGroup = useCallback(
    async (folderId) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      if (!groupId) {
        toast.error('Пользователь не принадлежит ни одной группе.');
        return;
      }

      const folder = folders.find((f) => f.id === folderId);
      if (!folder) {
        toast.error('Папка не найдена.');
        return;
      }

      if (folder.groupId === groupId) {
        toast.info('Папка уже доступна вашей группе.');
        return;
      }

      setIsLoading(true);
      try {
        const batch = writeBatch(db);

        // Обновляем groupId для самой папки
        const folderRef = doc(db, 'folders', folder.id);
        batch.update(folderRef, { groupId: groupId });

        // Итеративно обновляем groupId для всех вложенных папок и файлов
        await shareFolderIteratively(folder.folderPath, groupId, batch);

        // Выполняем пакетное обновление
        await batch.commit();

        // Обновляем локальное состояние
        await fetchFolders();
        await fetchFiles();

        toast.success(`Папка "${folder.name}" успешно поделена с вашей группой.`);
      } catch (error) {
        console.error('Ошибка при совместном использовании папки:', error);
        toast.error(`Не удалось поделиться папкой: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, groupId, folders, fetchFolders, fetchFiles]
  );

  // Итеративное обновление groupId для вложенных элементов
  const shareFolderIteratively = useCallback(async (folderPath, groupId, batch) => {
    try {
      // Обновляем groupId для файлов
      const filesQuery = query(collection(db, 'files'), where('directory', '==', folderPath), where('isDeleted', '==', false));
      const filesSnapshot = await getDocs(filesQuery);
      filesSnapshot.forEach((fileDoc) => {
        batch.update(fileDoc.ref, { groupId: groupId });
      });

      // Обновляем groupId для папок
      const foldersQuery = query(collection(db, 'folders'), where('directory', '==', folderPath), where('isDeleted', '==', false));
      const foldersSnapshot = await getDocs(foldersQuery);
      for (const folderDoc of foldersSnapshot.docs) {
        batch.update(folderDoc.ref, { groupId: groupId });
        const folderData = folderDoc.data();
        await shareFolderIteratively(folderData.folderPath, groupId, batch);
      }
    } catch (error) {
      console.error('Ошибка при совместном использовании содержимого папки:', error);
      throw error;
    }
  }, []);

  // Закрытие доступа к папке
  const handleUnshareFolderFromGroup = useCallback(
    async (folderId) => {
      if (!currentUser) {
        toast.error('Пользователь не авторизован.');
        return;
      }

      const folder = folders.find((f) => f.id === folderId);
      if (!folder) {
        toast.error('Папка не найдена.');
        return;
      }

      if (folder.groupId === null) {
        toast.info('Папка уже является приватной.');
        return;
      }

      setIsLoading(true);
      try {
        const batch = writeBatch(db);

        // Обновляем groupId для самой папки
        const folderRef = doc(db, 'folders', folder.id);
        batch.update(folderRef, { groupId: null });

        // Итеративно обновляем groupId для всех вложенных папок и файлов
        await unshareFolderIteratively(folder.folderPath, batch);

        // Выполняем пакетное обновление
        await batch.commit();

        // Обновляем локальное состояние
        await fetchFolders();
        await fetchFiles();

        toast.success(`Доступ к папке "${folder.name}" закрыт для группы.`);
      } catch (error) {
        console.error('Ошибка при закрытии доступа к папке:', error);
        toast.error(`Не удалось закрыть доступ к папке: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, folders, fetchFolders, fetchFiles]
  );

  // Итеративное обновление groupId для вложенных элементов
  const unshareFolderIteratively = useCallback(async (folderPath, batch) => {
    try {
      // Обновляем groupId для файлов
      const filesQuery = query(collection(db, 'files'), where('directory', '==', folderPath), where('isDeleted', '==', false));
      const filesSnapshot = await getDocs(filesQuery);
      filesSnapshot.forEach((fileDoc) => {
        batch.update(fileDoc.ref, { groupId: null });
      });

      // Обновляем groupId для папок
      const foldersQuery = query(collection(db, 'folders'), where('directory', '==', folderPath), where('isDeleted', '==', false));
      const foldersSnapshot = await getDocs(foldersQuery);
      for (const folderDoc of foldersSnapshot.docs) {
        batch.update(folderDoc.ref, { groupId: null });
        const folderData = folderDoc.data();
        await unshareFolderIteratively(folderData.folderPath, batch);
      }
    } catch (error) {
      console.error('Ошибка при закрытии доступа к содержимому папки:', error);
      throw error;
    }
  }, []);

  // Скачивание файла
  const handleDownloadFile = useCallback(async (file) => {
    try {
      const response = await fetch(file.downloadURL);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      toast.error(`Не удалось скачать файл: ${error.message}`);
    }
  }, []);

  // Копирование ссылки на файл
  const handleCopyLink = useCallback(async (file) => {
    try {
      await navigator.clipboard.writeText(file.downloadURL);
      toast.success('Ссылка скопирована в буфер обмена');
    } catch (err) {
      console.error('Ошибка при копировании ссылки:', err);
      toast.error(`Не удалось скопировать ссылку: ${err.message}`);
    }
  }, []);

  return {
    folders,
    files,
    isLoading,
    handleDeleteFolders,
    handleDeleteFiles,
    handleUploadFile,
    handleDownloadFile,
    handleCopyLink,
    handleCreateFolder,
    handleShareFolderToGroup,
    handleUnshareFolderFromGroup,
    handleRestoreFile,
    handlePermanentDeleteFile,
    handleRestoreFolder,
    handlePermanentDeleteFolder,
    currentUser
  };
};

export default useFiles;
