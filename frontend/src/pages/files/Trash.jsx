// src/pages/Trash.jsx

import React, { useEffect, useState } from 'react';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Typography, Stack, Divider, Checkbox, Button, CircularProgress, Box
} from '@mui/material';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { toast } from 'react-toastify';
import getFileIcon from 'utils/getFileIcon.jsx';

const Trash = ({ currentUser }) => {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchDeletedFiles = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "files"),
          where("ownerId", "==", currentUser.uid),
          where("isDeleted", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Удаленные файлы:", files); // Отладочное сообщение
        setDeletedFiles(files);
      } catch (error) {
        console.error("Ошибка при загрузке удаленных файлов:", error);
        toast.error("Ошибка при загрузке удаленных файлов");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDeletedFiles();
  }, [currentUser]);

  const handleRestore = async (file) => {
    try {
      const fileRef = doc(db, "files", file.id);
      await updateDoc(fileRef, {
        isDeleted: false,
        deletedAt: null,
      });
      setDeletedFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success(`Файл "${file.name}" восстановлен`);
    } catch (error) {
      console.error("Ошибка при восстановлении файла:", error);
      toast.error("Ошибка при восстановлении файла");
    }
  };

  const handlePermanentDelete = async (file) => {
    try {
      const fileRef = doc(db, "files", file.id);
      await deleteDoc(fileRef);
      setDeletedFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success(`Файл "${file.name}" удален окончательно`);
    } catch (error) {
      console.error("Ошибка при окончательном удалении файла:", error);
      toast.error("Ошибка при окончательном удалении файла");
    }
  };

  const handleSelectFile = (file) => {
    setSelectedFiles(prevSelected => {
      if (prevSelected.includes(file)) {
        return prevSelected.filter(f => f !== file);
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
      await Promise.all(selectedFiles.map(async (file) => {
        const fileRef = doc(db, "files", file.id);
        await updateDoc(fileRef, {
          isDeleted: false,
          deletedAt: null,
        });
      }));
      setDeletedFiles(prev => prev.filter(f => !selectedFiles.includes(f)));
      setSelectedFiles([]);
      toast.success("Выбранные файлы восстановлены");
    } catch (error) {
      console.error("Ошибка при восстановлении выбранных файлов:", error);
      toast.error("Ошибка при восстановлении выбранных файлов");
    }
  };

  const handlePermanentDeleteSelected = async () => {
    try {
      await Promise.all(selectedFiles.map(async (file) => {
        const fileRef = doc(db, "files", file.id);
        await deleteDoc(fileRef);
      }));
      setDeletedFiles(prev => prev.filter(f => !selectedFiles.includes(f)));
      setSelectedFiles([]);
      toast.success("Выбранные файлы удалены окончательно");
    } catch (error) {
      console.error("Ошибка при окончательном удалении выбранных файлов:", error);
      toast.error("Ошибка при окончательном удалении выбранных файлов");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Корзина
      </Typography>

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
                  checked={selectedFiles.length === deletedFiles.length}
                  onChange={handleSelectAll}
                  indeterminate={selectedFiles.length > 0 && selectedFiles.length < deletedFiles.length}
                />
                <Typography variant="h6">Имя файла</Typography>
                {selectedFiles.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RestoreFromTrashOutlinedIcon />}
                      onClick={handleRestoreSelected}
                    >
                      Восстановить
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={handlePermanentDeleteSelected}
                    >
                      Удалить окончательно
                    </Button>
                  </Stack>
                )}
              </Stack>
              <Divider />
              <List>
                {deletedFiles.map((file) => (
                  <ListItem key={file.id} button onClick={() => handleSelectFile(file)}>
                    <Checkbox
                      checked={selectedFiles.includes(file)}
                      onChange={() => handleSelectFile(file)}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ marginRight: 2 }}
                    />
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center">
                          {getFileIcon(file)}
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            {file.name}
                          </Typography>
                        </Stack>
                      }
                      secondary={`Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} | Удален: ${new Date(file.deletedAt).toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => handleRestore(file)} title="Восстановить">
                          <RestoreFromTrashOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={() => handlePermanentDelete(file)} title="Удалить окончательно">
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body1">
              Корзина пуста
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default Trash;
