import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Stack, Divider, Checkbox, Button, CircularProgress, IconButton, Tooltip, Grid, Box } from '@mui/material';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { toast } from 'react-toastify';
import useFiles from '../../hooks/useFiles';
import MainCard from '../../components/MainCard';
import FileListView from '../../components/FileListView';
import GetFileIcon from '../../utils/getFileIcon';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore импорты
import { db } from '../../firebaseConfig'; // Импорт db

const Trash = () => {
  // Состояния для удалённых файлов и папок
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [deletedFolders, setDeletedFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Состояния для выбранных файлов и папок (только ID)
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  // Использование хука useFiles
  const { handleRestoreFile, handlePermanentDeleteFile, handleRestoreFolder, handlePermanentDeleteFolder, currentUser } = useFiles('/');

  // Инициализация слушателя аутентификации и загрузка удалённых элементов
  useEffect(() => {
    const fetchDeletedItems = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        // Загрузка удалённых файлов
        const filesQuery = query(collection(db, 'files'), where('ownerId', '==', currentUser.uid), where('isDeleted', '==', true));
        const querySnapshotFiles = await getDocs(filesQuery);
        const files = querySnapshotFiles.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDeletedFiles(files);

        // Загрузка удалённых папок
        const foldersQuery = query(collection(db, 'folders'), where('ownerId', '==', currentUser.uid), where('isDeleted', '==', true));
        const querySnapshotFolders = await getDocs(foldersQuery);
        const folders = querySnapshotFolders.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDeletedFolders(folders);
      } catch (error) {
        console.error('Ошибка при загрузке удалённых элементов:', error);
        toast.error('Ошибка при загрузке удалённых элементов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeletedItems();
  }, [currentUser]);

  // Обработчики восстановления и удаления
  const handleRestoreSelectedFiles = useCallback(async () => {
    if (selectedFileIds.length === 0) {
      toast.error('Нет выбранных файлов для восстановления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFileIds.map(async (fileId) => {
          await handleRestoreFile(fileId);
        })
      );
      // Обновляем состояние удалённых файлов
      setDeletedFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
      setSelectedFileIds([]);
      toast.success('Файлы успешно восстановлены');
    } catch (error) {
      console.error('Ошибка при восстановлении файлов:', error);
      toast.error('Ошибка при восстановлении файлов');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFileIds, handleRestoreFile]);

  const handlePermanentDeleteSelectedFiles = useCallback(async () => {
    if (selectedFileIds.length === 0) {
      toast.error('Нет выбранных файлов для удаления');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите окончательно удалить ${selectedFileIds.length} файл(а)?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFileIds.map(async (fileId) => {
          await handlePermanentDeleteFile(fileId);
        })
      );
      // Обновляем состояние удалённых файлов
      setDeletedFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
      setSelectedFileIds([]);
      toast.success('Файлы окончательно удалены');
    } catch (error) {
      console.error('Ошибка при окончательном удалении файлов:', error);
      toast.error('Ошибка при окончательном удалении файлов');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFileIds, handlePermanentDeleteFile]);

  const handleRestoreSelectedFolders = useCallback(async () => {
    if (selectedFolderIds.length === 0) {
      toast.error('Нет выбранных папок для восстановления');
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFolderIds.map(async (folderId) => {
          await handleRestoreFolder(folderId);
        })
      );
      // Обновляем состояние удалённых папок
      setDeletedFolders((prev) => prev.filter((f) => !selectedFolderIds.includes(f.id)));
      setSelectedFolderIds([]);
      toast.success('Папки успешно восстановлены');
    } catch (error) {
      console.error('Ошибка при восстановлении папок:', error);
      toast.error('Ошибка при восстановлении папок');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolderIds, handleRestoreFolder]);

  const handlePermanentDeleteSelectedFolders = useCallback(async () => {
    if (selectedFolderIds.length === 0) {
      toast.error('Нет выбранных папок для удаления');
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите окончательно удалить ${selectedFolderIds.length} папку(и)?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedFolderIds.map(async (folderId) => {
          await handlePermanentDeleteFolder(folderId);
        })
      );
      // Обновляем состояние удалённых папок
      setDeletedFolders((prev) => prev.filter((f) => !selectedFolderIds.includes(f.id)));
      setSelectedFolderIds([]);
      toast.success('Папки окончательно удалены');
    } catch (error) {
      console.error('Ошибка при окончательном удалении папок:', error);
      toast.error('Ошибка при окончательном удалении папок');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolderIds, handlePermanentDeleteFolder]);

  // Функции для выбора папок и файлов
  const handleSelectFolder = useCallback((folderId) => {
    setSelectedFolderIds((prevSelected) => {
      if (prevSelected.includes(folderId)) {
        return prevSelected.filter((id) => id !== folderId);
      } else {
        return [...prevSelected, folderId];
      }
    });
  }, []);

  const handleSelectFile = useCallback((fileId) => {
    setSelectedFileIds((prevSelected) => {
      if (prevSelected.includes(fileId)) {
        return prevSelected.filter((id) => id !== fileId);
      } else {
        return [...prevSelected, fileId];
      }
    });
  }, []);

  const isFolderSelected = useCallback((folderId) => selectedFolderIds.includes(folderId), [selectedFolderIds]);
  const isFileSelected = useCallback((fileId) => selectedFileIds.includes(fileId), [selectedFileIds]);

  // Функция для выбора всех элементов
  const handleSelectAll = useCallback(() => {
    if (selectedFolderIds.length === deletedFolders.length && selectedFileIds.length === deletedFiles.length) {
      setSelectedFolderIds([]);
      setSelectedFileIds([]);
    } else {
      setSelectedFolderIds(deletedFolders.map((f) => f.id));
      setSelectedFileIds(deletedFiles.map((f) => f.id));
    }
  }, [deletedFolders, deletedFiles, selectedFolderIds.length, selectedFileIds.length]);

  const allSelected =
    selectedFolderIds.length === deletedFolders.length &&
    selectedFileIds.length === deletedFiles.length &&
    deletedFolders.length > 0 &&
    deletedFiles.length > 0;

  const indeterminate =
    (selectedFolderIds.length > 0 && selectedFolderIds.length < deletedFolders.length) ||
    (selectedFileIds.length > 0 && selectedFileIds.length < deletedFiles.length);

  return (
    <MainCard>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Checkbox checked={allSelected} indeterminate={indeterminate} onChange={handleSelectAll} />
        <Typography variant="h6">Выбрать все</Typography>
        {(selectedFolderIds.length > 0 || selectedFileIds.length > 0) && (
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            {selectedFileIds.length > 0 && (
              <>
                <Tooltip title="Восстановить выбранные файлы">
                  <IconButton onClick={handleRestoreSelectedFiles} color="primary">
                    <RestoreFromTrashOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Окончательно удалить выбранные файлы">
                  <IconButton onClick={handlePermanentDeleteSelectedFiles} color="error">
                    <DeleteForeverOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {selectedFolderIds.length > 0 && (
              <>
                <Tooltip title="Восстановить выбранные папки">
                  <IconButton onClick={handleRestoreSelectedFolders} color="primary">
                    <RestoreFromTrashOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Окончательно удалить выбранные папки">
                  <IconButton onClick={handlePermanentDeleteSelectedFolders} color="error">
                    <DeleteForeverOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        )}
      </Stack>

      {isLoading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {/* Раздел для удалённых папок */}
          {deletedFolders.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Папки
              </Typography>
              <Divider />
              <FileListView files={deletedFolders} selectedIds={selectedFolderIds} toggleSelection={handleSelectFolder} isFolder />
              <Divider sx={{ mt: 2, mb: 2 }} />
            </>
          )}

          {/* Раздел для удалённых файлов */}
          {deletedFiles.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Файлы
              </Typography>
              <Divider />
              <FileListView files={deletedFiles} selectedIds={selectedFileIds} toggleSelection={handleSelectFile} />
            </>
          )}

          {/* Если нет удалённых файлов и папок */}
          {deletedFiles.length === 0 && deletedFolders.length === 0 && <Typography variant="body1">Корзина пуста</Typography>}
        </>
      )}
    </MainCard>
  );
};

export default Trash;
