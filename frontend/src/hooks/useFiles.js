// src/hooks/useFiles.js
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, addDoc, collection, query, where, getDocs, getDoc, writeBatch } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import uploadToStorage from 'src/utils/uploadToFirebaseStorage';
import fileDownloadURL from 'utils/storage_download_via_url';
import { toast } from 'react-toastify';
import { getStorage, ref, deleteObject } from 'firebase/storage';

const useFiles = (currentDirectory) => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [groupId, setGroupId] = useState(undefined); // Изначально undefined

  const storage = getStorage();

  // Функция для получения groupId пользователя
  const fetchUserGroupId = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setGroupId(userData.groupId || null); // Устанавливаем groupId
        return userData.groupId || null;
      } else {
        console.error('Документ пользователя не найден');
        setGroupId(null);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении groupId пользователя:', error);
      setGroupId(null);
      return null;
    }
  };

  // Инициализация слушателя аутентификации и получения groupId
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserGroupId(user.uid); // Получаем groupId
      } else {
        console.warn('Пользователь не авторизован');
        setFolders([]);
        setFiles([]);
        setCurrentUser(null);
        setGroupId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Выполняем загрузку папок и файлов после того, как получили groupId и currentDirectory
  useEffect(() => {
    if (currentUser && groupId !== undefined) {
      fetchFolders();
      fetchFilesInFolder();
    }
  }, [currentUser, groupId, currentDirectory]);

  // Функция для получения папок
  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const currentPath = currentDirectory || '/';
      console.log('Fetching folders for Group ID:', groupId);
      console.log('Current Path:', currentPath);

      const queries = [];

      // Запрос для приватных папок текущего пользователя
      queries.push(
        query(
          collection(db, 'folders'),
          where('directory', '==', currentPath),
          where('isDeleted', '==', false),
          where('groupId', '==', null),
          where('ownerId', '==', currentUser.uid)
        )
      );

      // Запрос для папок, доступных группе пользователя
      if (groupId) {
        queries.push(
          query(
            collection(db, 'folders'),
            where('directory', '==', currentPath),
            where('isDeleted', '==', false),
            where('groupId', '==', groupId)
          )
        );
      }

      const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
      const fetchedFolders = [];
      querySnapshots.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedFolders.push({ id: doc.id, type: 'folder', ...data });
        });
      });

      console.log('Fetched Folders:', fetchedFolders);
      setFolders(fetchedFolders);
    } catch (error) {
      console.error('Ошибка при получении папок:', error);
      toast.error('Не удалось получить папки');
    } finally {
      setIsLoading(false);
    }
  };

  // Рекурсивная функция для отмены совместного использования папки и её содержимого
  const unshareFolderRecursively = async (folderPath, batch) => {
    // Получаем все подпапки внутри текущей папки
    const foldersQuery = query(collection(db, 'folders'), where('directory', '==', `${folderPath}/`), where('isDeleted', '==', false));

    const foldersSnapshot = await getDocs(foldersQuery);

    for (const docSnap of foldersSnapshot.docs) {
      const subFolder = docSnap.data();
      const subFolderRef = docSnap.ref;
      batch.update(subFolderRef, { groupId: null });

      const subFolderPath = `${subFolder.folderPath}/`;
      // Рекурсивно отменяем совместное использование подпапок
      await unshareFolderRecursively(subFolderPath, batch);
    }

    // Получаем все файлы внутри текущей папки
    const filesQuery = query(collection(db, 'files'), where('directory', '==', `${folderPath}/`), where('isDeleted', '==', false));

    const filesSnapshot = await getDocs(filesQuery);

    filesSnapshot.forEach((docSnap) => {
      const fileRef = docSnap.ref;
      batch.update(fileRef, { groupId: null });
    });
  };

  // Функция для отмены совместного использования папки с группой
  const handleUnshareFolderFromGroup = async (folder) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
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

      // Рекурсивно обновляем groupId для всех вложенных папок и файлов
      await unshareFolderRecursively(folder.folderPath, batch);

      // Выполняем пакетное обновление
      await batch.commit();

      // Обновляем локальное состояние
      await fetchFolders(currentUser.uid);
      await fetchFilesInFolder(currentUser.uid, currentDirectory);

      toast.success(`Доступ к папке "${folder.name}" закрыт для группы.`);
    } catch (error) {
      console.error('Ошибка при закрытии доступа к папке:', error);
      toast.error('Ошибка при закрытии доступа к папке.');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения файлов из Firestore
  const fetchFilesInFolder = async () => {
    setIsLoading(true);
    try {
      const currentPath = currentDirectory || '/';
      console.log('Fetching files for Group ID:', groupId);
      console.log('Current Path:', currentPath);

      const queries = [];

      // Запрос для приватных файлов текущего пользователя
      queries.push(
        query(
          collection(db, 'files'),
          where('directory', '==', currentPath),
          where('isDeleted', '==', false),
          where('groupId', '==', null),
          where('ownerId', '==', currentUser.uid)
        )
      );

      // Запрос для файлов, доступных группе пользователя
      if (groupId) {
        queries.push(
          query(
            collection(db, 'files'),
            where('directory', '==', currentPath),
            where('isDeleted', '==', false),
            where('groupId', '==', groupId)
          )
        );
      }

      const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
      const fetchedFiles = [];
      querySnapshots.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedFiles.push({ id: doc.id, type: 'file', ...data });
        });
      });

      console.log('Fetched Files:', fetchedFiles);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Ошибка при получении файлов:', error);
      toast.error('Не удалось получить файлы');
    } finally {
      setIsLoading(false);
    }
  };

  const shareFolderRecursively = async (folderPath, groupId, batch) => {
    const queue = [folderPath];

    while (queue.length > 0) {
      const currentPath = queue.shift();

      // Обновляем текущую папку
      const foldersQuery = query(collection(db, 'folders'), where('directory', '==', `${currentPath}/`), where('isDeleted', '==', false));

      const foldersSnapshot = await getDocs(foldersQuery);

      foldersSnapshot.forEach((docSnap) => {
        const subFolder = docSnap.data();
        const subFolderRef = docSnap.ref;
        batch.update(subFolderRef, { groupId: groupId });

        const subFolderPath = `${subFolder.folderPath}/`;
        queue.push(subFolderPath);
      });

      // Обновляем файлы в текущей папке
      const filesQuery = query(collection(db, 'files'), where('directory', '==', `${currentPath}/`), where('isDeleted', '==', false));

      const filesSnapshot = await getDocs(filesQuery);

      filesSnapshot.forEach((docSnap) => {
        const fileRef = docSnap.ref;
        batch.update(fileRef, { groupId: groupId });
      });
    }
  };

  // Функция для совместного использования папки с группой
  // Функция для совместного использования папки с группой
  const handleShareFolderToGroup = async (folder) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    if (!groupId) {
      toast.error('Пользователь не принадлежит ни одной группе.');
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

      // Рекурсивно обновляем groupId для всех вложенных папок и файлов
      await shareFolderRecursively(folder.folderPath, groupId, batch);

      // Выполняем пакетное обновление
      await batch.commit();

      // Обновляем локальное состояние
      await fetchFolders(currentUser.uid);
      await fetchFilesInFolder(currentUser.uid, currentDirectory);
      await fetchCurrentFolderGroupId(currentDirectory); // Добавлено для обновления groupId текущей папки

      toast.success(`Папка "${folder.name}" успешно поделена с вашей группой.`);
    } catch (error) {
      console.error('Ошибка при совместном использовании папки:', error);
      toast.error('Ошибка при совместном использовании папки с группой.');
    } finally {
      setIsLoading(false);
    }
  };

  // Инициализация слушателя аутентификации и загрузка данных
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchFolders(user.uid);
        await fetchFilesInFolder(user.uid, currentDirectory);
      } else {
        console.warn('Пользователь не авторизован');
        setFolders([]);
        setFiles([]);
        setCurrentUser(null);
        setGroupId(null);
      }
    });

    return () => unsubscribe();
  }, [currentDirectory]);

  // Функция для создания папки
  const handleCreateFolder = async (folderName, currentDirectory) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    // Проверка на существование папки с таким же именем в текущей директории
    const existingFolders = folders.filter((f) => f.name === folderName && f.groupId === groupId);
    if (existingFolders.length > 0) {
      toast.error(`Папка "${folderName}" уже существует`);
      return;
    }

    setIsLoading(true);
    try {
      const newPath = currentDirectory === '/' ? `/${folderName}/` : `${currentDirectory}${folderName}/`;
      const newFolder = {
        name: folderName,
        ownerId: currentUser.uid,
        directory: currentDirectory || '/', // Устанавливаем директорию корректно
        folderPath: newPath.slice(0, -1), // Удаляем завершающий '/'
        createdAt: Date.now(),
        isDeleted: false,
        deletedAt: null,
        groupId: null, // Изначально папка приватная
        type: 'folder'
      };

      const docRef = await addDoc(collection(db, 'folders'), newFolder);
      const folderWithId = { id: docRef.id, type: 'folder', ...newFolder };

      setFolders((prevFolders) => [...prevFolders, folderWithId]);
      toast.success(`Папка "${folderName}" успешно создана`);
    } catch (error) {
      console.error('Ошибка при создании папки:', error);
      toast.error('Ошибка при создании папки');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция загрузки файлов
  // Функция загрузки файлов
  const handleUploadFile = async (file, currentDirectory) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    setIsLoading(true);
    try {
      const { downloadURL, filePath } = await uploadToStorage(file, currentDirectory);

      // Получаем groupId текущей папки
      const folderGroupId = currentFolderGroupId; // Используем состояние
      const newFile = {
        name: file.name,
        size: file.size,
        last_modified: Date.now(),
        ownerId: currentUser.uid,
        downloadURL,
        path: filePath,
        directory: currentDirectory || '/', // Устанавливаем директорию корректно
        isDeleted: false,
        deletedAt: null,
        type: 'file',
        groupId: folderGroupId // Устанавливаем groupId исходя из папки
      };

      const docRef = await addDoc(collection(db, 'files'), newFile);
      const fileWithId = { id: docRef.id, type: 'file', ...newFile };

      setFiles((prevFiles) => [...prevFiles, fileWithId]);
      toast.success('Файл успешно загружен!');
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      toast.error('Ошибка при загрузке файла!');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция скачивания файла
  const handleDownloadFile = async (file) => {
    try {
      const URL = file.downloadURL || (await fileDownloadURL(file));
      // Инициируем скачивание файла
      const link = document.createElement('a');
      link.href = URL;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      toast.error('Ошибка при скачивании файла');
    }
  };

  // Функция копирования ссылки на файл
  const handleCopyLink = async (file) => {
    try {
      await navigator.clipboard.writeText(file.downloadURL);
      toast.success('Ссылка скопирована в буфер обмена');
    } catch (err) {
      console.error('Ошибка при копировании ссылки:', err);
      toast.error('Ошибка при копировании ссылки');
    }
  };

  // Функция удаления папок (перемещение в корзину)
  const handleDeleteFolders = async (selectedFolders) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    if (selectedFolders.length === 0) {
      toast.warn('Не выбрано ни одной папки для удаления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFolders.map(async (folder) => {
          // Проверка, пустая ли папка
          const q = query(collection(db, 'files'), where('directory', '==', `${folder.folderPath}/`), where('isDeleted', '==', false));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            toast.error(`Папка "${folder.name}" не пустая`);
            return;
          }

          // Пометка папки как удалённой
          const folderRef = doc(db, 'folders', folder.id);
          await updateDoc(folderRef, {
            isDeleted: true,
            deletedAt: Date.now()
          });

          // Удаление папки из состояния
          setFolders((prevFolders) => prevFolders.filter((f) => f.id !== folder.id));
        })
      );
      toast.success('Папки перемещены в корзину');
    } catch (error) {
      console.error('Ошибка при удалении папок:', error);
      toast.error('Ошибка при удалении папок');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция удаления файлов (перемещение в корзину)
  const handleDeleteFiles = async (selectedFiles) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.warn('Не выбрано ни одного файла для удаления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFiles.map(async (file) => {
          // Пометка файла как удалённого
          const fileRef = doc(db, 'files', file.id);
          await updateDoc(fileRef, {
            isDeleted: true,
            deletedAt: Date.now()
          });

          // Удаление файла из Storage
          const storageRef = ref(storage, file.path);
          await deleteObject(storageRef);

          // Удаление файла из состояния
          setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
        })
      );
      toast.success('Файлы перемещены в корзину');
    } catch (error) {
      console.error('Ошибка при удалении файлов:', error);
      toast.error('Ошибка при удалении файлов');
    } finally {
      setIsLoading(false);
    }
  };

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
    currentUser
  };
};

export default useFiles;
