// src/hooks/useFiles.js
import { useState, useEffect } from 'react';
import { getUserFiles } from 'src/utils/GetUserFiles';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import deleteFile from 'src/utils/storage_delete_file';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import uploadToStorage from 'src/utils/uploadToFirebaseStorage';
import fileDownloadURL from 'utils/storage_download_via_url';
import { toast } from 'react-toastify';

const useFiles = (currentDirectory) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoading(true);
        const userFiles = await getUserFiles(user.uid, currentDirectory);
        setFiles(userFiles);
        setIsLoading(false);
      } else {
        console.warn("Пользователь не авторизован");
        setFiles([]);
      }
    });

    return () => unsubscribe();
  }, [currentDirectory]);

  const handleDeleteFiles = async (selectedFiles) => {
    if (selectedFiles.length === 0) {
      toast.warn("Не выбрано ни одного файла для удаления");
      return;
    }
    setIsLoading(true);
    try {
      await Promise.all(selectedFiles.map(async (file) => {
        if (file.type === 'folder') {
          // Проверяем, пустая ли папка
          const folderContents = await getUserFiles(currentUser.uid, `${file.directory}${file.name}/`);
          if (folderContents.length > 0) {
            toast.error(`Папка "${file.name}" не пустая`);
            return;
          }
        }
        await deleteFile(file);
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
      }));
      toast.success("Файлы удалены");
    } catch (error) {
      console.error("Ошибка при удалении выбранных файлов:", error);
      toast.error("Ошибка при удалении файлов");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file, currentDirectory) => {
    if (!currentUser) {
      toast.error("Пользователь не авторизован. Пожалуйста, войдите в систему.");
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
      };

      const docRef = await addDoc(collection(db, "files"), newFile);
      const fileWithId = { id: docRef.id, ...newFile };

      setFiles((prevFiles) => [...prevFiles, fileWithId]);
      toast.success("Файл успешно загружен!");
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      toast.error("Ошибка при загрузке файла!");
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error("Ошибка при скачивании файла:", error);
      toast.error("Ошибка при скачивании файла");
    }
  };

  const handleCopyLink = async (file) => {
    try {
      await navigator.clipboard.writeText(file.downloadURL);
      toast.success("Ссылка скопирована в буфер обмена");
    } catch (err) {
      console.error("Ошибка при копировании ссылки:", err);
      toast.error("Ошибка при копировании ссылки");
    }
  };

  const handleCreateFolder = async (folderName, currentDirectory) => {
    if (!currentUser) {
      toast.error("Пользователь не авторизован. Пожалуйста, войдите в систему.");
      return;
    }

    // Проверка на существование папки с таким же именем в текущей директории
    const existingFolders = files.filter(f => f.type === 'folder' && f.name === folderName);
    if (existingFolders.length > 0) {
      toast.error(`Папка "${folderName}" уже существует`);
      return;
    }

    try {
      const newFolder = {
        name: folderName,
        ownerId: currentUser.uid,
        directory: currentDirectory,
        type: 'folder',
        last_modified: Date.now()
      };

      const docRef = await addDoc(collection(db, "files"), newFolder);
      const folderWithId = { id: docRef.id, ...newFolder };

      setFiles((prevFiles) => [...prevFiles, folderWithId]);
      toast.success(`Папка "${folderName}" успешно создана`);
    } catch (error) {
      console.error("Ошибка при создании папки:", error);
      toast.error("Ошибка при создании папки");
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
