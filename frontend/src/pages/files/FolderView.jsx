import React, { useState, useEffect } from 'react';
import { db } from 'firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { ArrowBack, Folder, FileUpload } from '@mui/icons-material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

export default function FolderView() {
  const [currentFolderId, setCurrentFolderId] = useState(null); // ID текущей папки
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);
  const storage = getStorage();

  useEffect(() => {
    fetchFolders();
  }, [currentFolderId]);

  const fetchFolders = async () => {
    // Получаем папки
    const folderQuery = query(collection(db, 'folders'), where('parentId', '==', currentFolderId));
    const folderDocs = await getDocs(folderQuery);
    const fetchedFolders = folderDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFolders(fetchedFolders);

    // Получаем файлы в текущей папке, если у текущей папки есть ID
    if (currentFolderId) {
      const currentFolderDoc = await getDoc(doc(db, 'folders', currentFolderId));
      if (currentFolderDoc.exists()) {
        setFiles(currentFolderDoc.data()?.files || []);
      }
    } else {
      setFiles([]); // Корневая папка
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await addDoc(collection(db, 'folders'), {
        name: newFolderName,
        parentId: currentFolderId,
        files: []
      });
      toast.success('Папка создана успешно!');
      setOpenNewFolderDialog(false);
      setNewFolderName('');
      fetchFolders();
    } catch (error) {
      console.error('Ошибка при создании папки:', error);
      toast.error('Не удалось создать папку');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileRef = ref(storage, `uploads/${currentFolderId || 'root'}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const folderRef = doc(db, 'folders', currentFolderId || 'rootFolder');
      await updateDoc(folderRef, {
        files: [...files, { name: file.name, url, size: file.size, lastModified: file.lastModified }]
      });

      toast.success('Файл загружен успешно!');
      fetchFolders();
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      toast.error('Не удалось загрузить файл');
    }
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolderId(folderId);
  };

  const navigateBack = () => {
    if (currentFolderId) {
      // Получаем данные текущей папки и возвращаемся на уровень вверх
      const parentFolder = folders.find(folder => folder.id === currentFolderId)?.parentId || null;
      setCurrentFolderId(parentFolder);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Файловый менеджер</Typography>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={navigateBack} disabled={!currentFolderId}>
          Назад
        </Button>
        <Button variant="outlined" startIcon={<Folder />} onClick={() => setOpenNewFolderDialog(true)}>
          Создать папку
        </Button>
        <input
          type="file"
          style={{ display: 'none' }}
          id="file-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <Button variant="outlined" startIcon={<FileUpload />} component="span">
            Загрузить файл
          </Button>
        </label>
      </div>

      <List>
        {folders.map(folder => (
          <ListItem key={folder.id} button onClick={() => navigateToFolder(folder.id)}>
            <Folder style={{ marginRight: '10px' }} />
            <ListItemText primary={folder.name} />
          </ListItem>
        ))}
        {files.map(file => (
          <ListItem key={file.name}>
            <ListItemText
              primary={file.name}
              secondary={`Размер: ${(file.size / (1024 * 1024)).toFixed(2)} MB | Дата изменения: ${new Date(file.lastModified).toLocaleString()}`}
            />
            <IconButton onClick={() => window.open(file.url, '_blank')}>
              <FileUpload />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={openNewFolderDialog} onClose={() => setOpenNewFolderDialog(false)}>
        <DialogTitle>Создать новую папку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название папки"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewFolderDialog(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleCreateFolder} color="primary">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
