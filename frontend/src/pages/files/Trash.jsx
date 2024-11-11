// src/pages/Trash.jsx

import React, { useEffect, useState } from 'react';
import { Typography, Stack, Divider, Checkbox, Button, CircularProgress, Box, IconButton } from '@mui/material';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { toast } from 'react-toastify';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import FileListView from 'src/components/FileListView'; // Импортируем компонент списка файлов
import MainCard from 'components/MainCard';
import getFileIcon from 'utils/getFileIcon';

const Trash = () => {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    const fetchDeletedFiles = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, 'files'), where('ownerId', '==', currentUser.uid), where('isDeleted', '==', true));
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDeletedFiles(files);
      } catch (error) {
        console.error('Ошибка при загрузке удаленных файлов:', error);
        toast.error('Ошибка при загрузке удаленных файлов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeletedFiles();
  }, [currentUser]);

  const handleRestore = async (file) => {
    try {
      const fileRef = doc(db, 'files', file.id);
      await updateDoc(fileRef, {
        isDeleted: false,
        deletedAt: null
      });
      setDeletedFiles((prev) => prev.filter((f) => f.id !== file.id));
      setSelectedFiles((prevSelected) => prevSelected.filter((f) => f.id !== file.id));
      toast.success(`Файл "${file.name}" восстановлен`);
    } catch (error) {
      console.error('Ошибка при восстановлении файла:', error);
      toast.error('Ошибка при восстановлении файла');
    }
  };

  const handlePermanentDelete = async (file) => {
    try {
      const fileRef = doc(db, 'files', file.id);
      await deleteDoc(fileRef);
      setDeletedFiles((prev) => prev.filter((f) => f.id !== file.id));
      setSelectedFiles((prevSelected) => prevSelected.filter((f) => f.id !== file.id));
      toast.success(`Файл "${file.name}" удален окончательно`);
    } catch (error) {
      console.error('Ошибка при окончательном удалении файла:', error);
      toast.error('Ошибка при окончательном удалении файла');
    }
  };

  const handleSelectFile = (file) => {
    setSelectedFiles((prevSelected) => {
      if (prevSelected.some((f) => f.id === file.id)) {
        return prevSelected.filter((f) => f.id !== file.id);
      } else {
        return [...prevSelected, file];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === deletedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...deletedFiles]);
    }
  };

  const handleRestoreSelected = async () => {
    try {
      await Promise.all(
        selectedFiles.map(async (file) => {
          const fileRef = doc(db, 'files', file.id);
          await updateDoc(fileRef, {
            isDeleted: false,
            deletedAt: null
          });
        })
      );
      setDeletedFiles((prev) => prev.filter((f) => !selectedFiles.some((sf) => sf.id === f.id)));
      setSelectedFiles([]);
      toast.success('Выбранные файлы восстановлены');
    } catch (error) {
      console.error('Ошибка при восстановлении выбранных файлов:', error);
      toast.error('Ошибка при восстановлении выбранных файлов');
    }
  };

  const handlePermanentDeleteSelected = async () => {
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
    }
  };

  // Функция для отображения действий с файлами
  const fileActions = (file) => (
    <Stack direction="row" spacing={1}>
      <IconButton onClick={() => handleRestore(file)} title="Восстановить">
        <RestoreFromTrashOutlinedIcon />
      </IconButton>
      <IconButton onClick={() => handlePermanentDelete(file)} title="Удалить окончательно">
        <DeleteForeverOutlinedIcon />
      </IconButton>
    </Stack>
  );

  return (
    <MainCard sx={{ p: 4 }}>
      {isLoading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {deletedFiles.length > 0 ? (
            <>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
                <Checkbox
                  checked={selectedFiles.length === deletedFiles.length && deletedFiles.length > 0}
                  onChange={handleSelectAll}
                  indeterminate={selectedFiles.length > 0 && selectedFiles.length < deletedFiles.length}
                />
                <Typography variant="h6">Имя файла</Typography>
                {selectedFiles.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                    <Button variant="outlined" color="primary" startIcon={<RestoreFromTrashOutlinedIcon />} onClick={handleRestoreSelected}>
                      Восстановить
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={handlePermanentDeleteSelected}
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
          ) : (
            <Typography variant="body1">Корзина пуста</Typography>
          )}
        </>
      )}
    </MainCard>
  );
};

export default Trash;
