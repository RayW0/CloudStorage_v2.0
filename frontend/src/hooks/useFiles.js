// src/hooks/useFiles.js 
import { useState, useEffect } from 'react';
import { getUserFiles } from 'src/utils/GetUserFiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import uploadToStorage from 'src/utils/uploadToFirebaseStorage';
import fileDownloadURL from 'utils/storage_download_via_url';
import { toast } from 'react-toastify';

const useFiles = (currentDirectory) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Инициализация слушателя аутентификации
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchFiles(user.uid, currentDirectory);
      } else {
        console.warn('Пользователь не авторизован');
        setFiles([]);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [currentDirectory]);

  // Функция для загрузки файлов, учитывая фильтр isDeleted: false
  const fetchFiles = async (uid, directory) => {
    setIsLoading(true);
    try {
      const userFiles = await getUserFiles(uid, directory, false); // Передаем параметр isDeleted = false
      setFiles(userFiles);
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      toast.error('Ошибка при загрузке файлов');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция удаления файлов (перемещение в корзину)
  const handleDeleteFiles = async (selectedFiles) => {
    if (!currentUser) {
      toast.error("Пользователь не авторизован. Пожалуйста, войдите в систему.");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.warn("Не выбрано ни одного файла для удаления");
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(selectedFiles.map(async (file) => {
        if (file.type === 'folder') {
          // Проверка, пустая ли папка
          const folderContents = await getUserFiles(currentUser.uid, `${file.directory}${file.name}/`, false);
          if (folderContents.length > 0) {
            toast.error(`Папка "${file.name}" не пустая`);
            return;
          }
        }
        // Пометка файла как удаленного
        const fileRef = doc(db, "files", file.id);
        await updateDoc(fileRef, {
          isDeleted: true,
          deletedAt: Date.now(), // Или используйте Firestore Timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
      }));
      toast.success("Файлы перемещены в корзину");
    } catch (error) {
      console.error("Ошибка при удалении выбранных файлов:", error);
      toast.error("Ошибка при удалении файлов");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция загрузки файлов
  const handleUploadFile = async (file, currentDirectory) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    setIsLoading(true);
    try {
      const { downloadURL, filePath } = await uploadToStorage(file, currentDirectory);
      const newFile = {
        name: file.name,
        size: file.size,
        last_modified: file.lastModified,
        ownerId: currentUser.uid,
        downloadURL,
        path: filePath,
        directory: currentDirectory,
        type: 'file',
        isDeleted: false, // Явно устанавливаем как не удаленный
        deletedAt: null,  // Явно устанавливаем как не удаленный
      };

      const docRef = await addDoc(collection(db, 'files'), newFile);
      const fileWithId = { id: docRef.id, ...newFile };

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
      const URL = await fileDownloadURL(file);
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

  // Функция создания папки
  const handleCreateFolder = async (folderName) => {
    if (!currentUser) {
      toast.error('Пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    // Проверка на существование папки с таким же именем в текущей директории
    const existingFolders = files.filter((f) => f.type === 'folder' && f.name === folderName);
    if (existingFolders.length > 0) {
      toast.error(`Папка "${folderName}" уже существует`);
      return;
    }

    setIsLoading(true);
    try {
      const newFolder = {
        name: folderName,
        ownerId: currentUser.uid,
        directory: currentDirectory,
        type: 'folder',
        last_modified: Date.now(),
        isDeleted: false, // Новая папка не удалена
        deletedAt: null,
      };

      const docRef = await addDoc(collection(db, 'files'), newFolder);
      const folderWithId = { id: docRef.id, ...newFolder };

      setFiles((prevFiles) => [...prevFiles, folderWithId]);
      toast.success(`Папка "${folderName}" успешно создана`);
    } catch (error) {
      console.error('Ошибка при создании папки:', error);
      toast.error('Ошибка при создании папки');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    files,
    isLoading,
    handleDeleteFiles,
    handleUploadFile,
    handleDownloadFile,
    handleCopyLink,
    handleCreateFolder,
    currentUser
  };
};

export default useFiles;
