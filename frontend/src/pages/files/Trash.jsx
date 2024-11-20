// src/pages/Trash.jsx

import React, { useEffect, useState } from 'react';
import { Typography, Stack, Divider, Checkbox, Button, CircularProgress, IconButton } from '@mui/material';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { toast } from 'react-toastify';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import FileListView from 'src/components/FileListView';
import MainCard from 'components/MainCard';
import useFiles from 'hooks/useFiles';


const Trash = () => {
  // Состояния для удалённых файлов и папок
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [deletedFolders, setDeletedFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('/');
  // Состояния для выбранных файлов и папок
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);

  // Состояние текущего пользователя
  const [currentUser, setCurrentUser] = useState(null);

  const {
    handleRestoreFolder,
    handleRestoreFile,
    handlePermanentDeleteFolders,
    handlePermanentDeleteFiles,
  } = useFiles(currentDirectory);

  // Инициализация слушателя аутентификации
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Функция для расчёта размера папки
  const calculateFolderSize = async (folderPath) => {
    try {
      const qFiles = query(
        collection(db, 'files'),
        where('directory', '==', `${folderPath}/`),
        where('isDeleted', '==', true)
      );
      const querySnapshotFiles = await getDocs(qFiles);
      let totalSize = 0;
      querySnapshotFiles.forEach((doc) => {
        const data = doc.data();
        if (data.size) {
          totalSize += data.size;
        }
      });

      // Проверка вложенных папок
      const qFolders = query(
        collection(db, 'folders'),
        where('directory', '==', `${folderPath}/`),
        where('isDeleted', '==', true)
      );
      const querySnapshotFolders = await getDocs(qFolders);
      for (const subDoc of querySnapshotFolders.docs) {
        const subFolder = subDoc.data();
        const subFolderSize = await calculateFolderSize(subFolder.folderPath);
        totalSize += subFolderSize;
      }

      return totalSize;
    } catch (error) {
      console.error(`Ошибка при расчёте размера папки ${folderPath}:`, error);
      return 0;
    }
  };

  // Загрузка удалённых файлов и папок
  useEffect(() => {
    const fetchDeletedItems = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        // Запрос для удалённых файлов
        const qFiles = query(
          collection(db, 'files'),
          where('ownerId', '==', currentUser.uid),
          where('isDeleted', '==', true)
        );
        const querySnapshotFiles = await getDocs(qFiles);
        const files = querySnapshotFiles.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDeletedFiles(files);

        // Запрос для удалённых папок
        const qFolders = query(
          collection(db, 'folders'),
          where('ownerId', '==', currentUser.uid),
          where('isDeleted', '==', true)
        );
        const querySnapshotFolders = await getDocs(qFolders);
        const folders = await Promise.all(
          querySnapshotFolders.docs.map(async (doc) => {
            const data = doc.data();
            const size = await calculateFolderSize(data.folderPath);
            return { id: doc.id, ...data, size };
          })
        );
        setDeletedFolders(folders);
      } catch (error) {
        console.error('Ошибка при загрузке удаленных элементов:', error);
        toast.error('Ошибка при загрузке удаленных элементов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeletedItems();
  }, [currentUser]);
  

  // Обработчики для восстановления и удаления выбранных файлов и папок
  const handleRestoreSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Нет выбранных файлов для восстановления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFiles.map(async (file) => {
          const fileRef = doc(db, 'files', file.id);
          await updateDoc(fileRef, {
            isDeleted: false,
            deletedAt: null,
            // Удалите следующую строку, если не требуется обновлять downloadURL
            // downloadURL: downloadURL
          });
        })
      );
      setDeletedFiles((prev) => prev.filter((f) => !selectedFiles.some((sf) => sf.id === f.id)));
      setSelectedFiles([]);
      toast.success('Выбранные файлы восстановлены');
    } catch (error) {
      console.error('Ошибка при восстановлении выбранных файлов:', error);
      toast.error('Ошибка при восстановлении выбранных файлов');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDeleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Нет выбранных файлов для удаления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFiles.map(async (file) => {
          const fileRef = doc(db, 'files', file.id);
          await deleteDoc(fileRef);
        })
      );
      setDeletedFiles((prev) => prev.filter((f) => !selectedFiles.some((sf) => sf.id === f.id)));
      setSelectedFiles([]);
      toast.success('Выбранные файлы удалены окончательно');
    } catch (error) {
      console.error('Ошибка при окончательном удалении выбранных файлов:', error);
      toast.error('Ошибка при окончательном удалении выбранных файлов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreSelectedFolders = async () => {
    if (selectedFolders.length === 0) {
      toast.error('Нет выбранных папок для восстановления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFolders.map(async (folder) => {
          const folderRef = doc(db, 'folders', folder.id);
          await updateDoc(folderRef, {
            isDeleted: false,
            deletedAt: null
          });
        })
      );
      setDeletedFolders((prev) => prev.filter((f) => !selectedFolders.some((sf) => sf.id === f.id)));
      setSelectedFolders([]);
      toast.success('Выбранные папки восстановлены');
    } catch (error) {
      console.error('Ошибка при восстановлении выбранных папок:', error);
      toast.error('Ошибка при восстановлении выбранных папок');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDeleteSelectedFolders = async () => {
    if (selectedFolders.length === 0) {
      toast.error('Нет выбранных папок для удаления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFolders.map(async (folder) => {
          // Проверка, пустая ли папка
          const qFiles = query(
            collection(db, 'files'),
            where('directory', '==', `${folder.folderPath}/`),
            where('isDeleted', '==', true)
          );
          const querySnapshotFiles = await getDocs(qFiles);
          if (!querySnapshotFiles.empty) {
            toast.error(`Папка "${folder.name}" содержит файлы и не может быть удалена окончательно`);
            return;
          }

          const qFolders = query(
            collection(db, 'folders'),
            where('directory', '==', `${folder.folderPath}/`),
            where('isDeleted', '==', true)
          );
          const querySnapshotFolders = await getDocs(qFolders);
          if (!querySnapshotFolders.empty) {
            toast.error(`Папка "${folder.name}" содержит вложенные папки и не может быть удалена окончательно`);
            return;
          }

          // Удаление папки
          const folderRef = doc(db, 'folders', folder.id);
          await deleteDoc(folderRef);
        })
      );

      // Обновление состояния после удаления
      setDeletedFolders((prev) => prev.filter((f) => !selectedFolders.some((sf) => sf.id === f.id)));
      setSelectedFolders([]);
      toast.success('Выбранные папки удалены окончательно');
    } catch (error) {
      console.error('Ошибка при окончательном удалении папок:', error);
      toast.error('Ошибка при окончательном удалении папок');
    } finally {
      setIsLoading(false);
    }
  };


   // Функция для выбора папок и файлов
   const handleSelectFile = (item) => {
    setSelectedFiles((prevSelectedItems) => {
      if (prevSelectedItems.includes(item)) {
        return prevSelectedItems.filter((i) => i !== item);
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

  
  const handleSelectFolder = (folder) => {
    setSelectedFolders((prevSelected) => {
      if (prevSelected.some((f) => f.id === folder.id)) {
        return prevSelected.filter((f) => f.id !== folder.id);
      } else {
        return [...prevSelected, folder];
      }
    });
  };

  // Обработчики выбора всех файлов и папок
  const handleSelectAllFiles = () => {
    if (selectedFiles.length === deletedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...deletedFiles]);
    }
  };

  const handleSelectAllFolders = () => {
    if (selectedFolders.length === deletedFolders.length) {
      setSelectedFolders([]);
    } else {
      setSelectedFolders([...deletedFolders]);
    }
  };

  // Функции для отображения действий с файлами и папками
  const fileActions = (file) => (
    <Stack direction="row" spacing={1}>
      <IconButton onClick={() => handleRestoreFile(file)} title="Восстановить">
        <RestoreFromTrashOutlinedIcon />
      </IconButton>
      <IconButton onClick={() => handlePermanentDeleteFiles(file)} title="Удалить окончательно">
        <DeleteForeverOutlinedIcon />
      </IconButton>
    </Stack>
  );

  const folderActions = (folder) => (
    <Stack direction="row" spacing={1}>
      <IconButton onClick={() => handleRestoreFolder(folder)} title="Восстановить">
        <RestoreFromTrashOutlinedIcon />
      </IconButton>
      <IconButton onClick={() => handlePermanentDeleteFolders(folder)} title="Удалить окончательно">
        <DeleteForeverOutlinedIcon />
      </IconButton>
    </Stack>
  );

  return (
    <MainCard>
      {isLoading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {deletedFiles.length > 0 || deletedFolders.length > 0 ? (
            <>
              {/* Раздел для удалённых папок */}
              {deletedFolders.length > 0 && (
                <>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
                    <Checkbox
                      checked={selectedFolders.length === deletedFolders.length && deletedFolders.length > 0}
                      onChange={handleSelectAllFolders}
                      indeterminate={selectedFolders.length > 0 && selectedFolders.length < deletedFolders.length}
                    />
                    <Typography variant="h6">Папки</Typography>
                    {selectedFolders.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<RestoreFromTrashOutlinedIcon />}
                          onClick={handleRestoreSelectedFolders}
                        >
                          Восстановить
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteForeverOutlinedIcon />}
                          onClick={handlePermanentDeleteSelectedFolders}
                        >
                          Удалить
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                  <Divider />
                  <FileListView
                    files={deletedFolders}
                    selectedFiles={selectedFolders}
                    toggleFileSelection={handleSelectFolder}
                    actionButtons={folderActions}
                    isFolder // Передаём проп, чтобы указать, что это папка
                  />
                </>
              )}

              {/* Раздел для удалённых файлов */}
              {deletedFiles.length > 0 && (
                <>
                  <Stack direction="row" spacing={2} sx={{ mb: 2, mt: deletedFolders.length > 0 ? 4 : 0 }} alignItems="center">
                    <Checkbox
                      checked={selectedFiles.length === deletedFiles.length && deletedFiles.length > 0}
                      onChange={handleSelectAllFiles}
                      indeterminate={selectedFiles.length > 0 && selectedFiles.length < deletedFiles.length}
                    />
                    <Typography variant="h6">Файлы</Typography>
                    {selectedFiles.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<RestoreFromTrashOutlinedIcon />}
                          onClick={handleRestoreSelectedFiles}
                        >
                          Восстановить
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteForeverOutlinedIcon />}
                          onClick={handlePermanentDeleteSelectedFiles}
                        >
                          Удалить
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                  <Divider />
                  <FileListView
                    files={deletedFiles}
                    selectedFiles={selectedFiles}
                    toggleFileSelection={handleSelectFile}
                    actionButtons={fileActions}
                  />
                </>
              )}
            </>
          ) : (
            <Typography variant="body1">Корзина пуста</Typography>
          )}
        </>
      )}
    </MainCard>
  );
};

export default Trash;
