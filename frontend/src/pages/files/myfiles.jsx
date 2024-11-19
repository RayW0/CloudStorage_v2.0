// src/components/FileList.jsx

import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Stack,
  Divider,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  Box,
  Tooltip
} from '@mui/material';
import { DownloadOutlined, DeleteOutlined, ShareAltOutlined, LinkOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import BreadcrumbsNav from 'components/@extended/BreadcrumbsNav';
import SortControls from 'components/@extended/SortControls';
import FileActions from 'components/files/FileActions';
import ViewModeToggle from 'components/@extended/ViewModeToggle';
import useFiles from 'hooks/useFiles';
import useSort from 'hooks/useSort';
import GetFileIcon from 'utils/getFileIcon';

const FileList = () => {
  // Определение состояния
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([]); // Массив выбранных папок и файлов
  const [selectAll, setSelectAll] = useState(false);

  // Инициализация currentDirectory как '/'
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [viewMode, setViewMode] = useState('list'); // 'list' или 'grid'

  // Использование вашего хука useFiles, передавая currentDirectory
  const {
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
  } = useFiles(currentDirectory);

  // Отсортированные папки и файлы
  const sortedFolders = useSort(folders, sortField, sortOrder);
  const sortedFiles = useSort(files, sortField, sortOrder);

  // Объединяем папки и файлы для выборки "Выбрать все"
  const allItems = [...sortedFolders, ...sortedFiles];

  // Логирование текущего состояния для отладки
  useEffect(() => {
    console.log('Current Directory in FileList:', currentDirectory);
    console.log('Sorted Folders:', sortedFolders);
    console.log('Sorted Files:', sortedFiles);
  }, [currentDirectory, sortedFolders, sortedFiles]);

  const handleSortFieldChange = (event) => {
    setSortField(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Функция для открытия папки
  const handleOpenFolder = (folder) => {
    const newPath = currentDirectory === '/' ? `/${folder.name}/` : `${currentDirectory}${folder.name}/`; // Добавляем имя папки и '/'
    console.log('Navigating to:', newPath);
    setCurrentDirectory(newPath); // Обновляем currentDirectory
  };

  // Функция для навигации назад
  const handleNavigateBack = () => {
    if (currentDirectory === '/') {
      console.log('Already at root directory');
      return; // Уже на корневой директории
    }

    const paths = currentDirectory.split('/').filter((p) => p);
    paths.pop();
    const newPath = paths.length > 0 ? `/${paths.join('/')}/` : '/'; // Возвращаемся к '/' если нет родительских директорий
    console.log('Navigating back to:', newPath);
    setCurrentDirectory(newPath);
  };

  // Функция для удаления выбранных папок и файлов
  const handleDeleteSelected = () => {
    const selectedFolders = selectedItems.filter((item) => item.type === 'folder');
    const selectedFiles = selectedItems.filter((item) => item.type === 'file');

    if (selectedFolders.length > 0) {
      handleDeleteFolders(selectedFolders);
    }
    if (selectedFiles.length > 0) {
      handleDeleteFiles(selectedFiles);
    }
    setSelectedItems([]);
    setSelectAll(false);
  };

  // Функция для выбора папок и файлов
  const handleSelectItem = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(item)) {
        return prevSelectedItems.filter((i) => i !== item);
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

  const isItemSelected = (item) => selectedItems.includes(item);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...allItems]);
    }
    setSelectAll(!selectAll);
  };

  // Функция для форматирования даты
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Дата неизвестна';

    let date;
    if (typeof timestamp === 'object' && timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleString();
  };

  return (
    <MainCard>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <BreadcrumbsNav currentDirectory={currentDirectory} onNavigateBack={handleNavigateBack} />
        <SortControls
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={handleSortFieldChange}
          onSortOrderChange={handleSortOrderChange}
        />
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleUploadFile(file, currentDirectory);
            }
          }}
        />
        <FileActions
          onUploadClick={() => document.getElementById('file-upload').click()}
          onCreateFolderClick={() => {
            const folderName = prompt('Введите имя новой папки:');
            if (folderName) {
              handleCreateFolder(folderName, currentDirectory);
            }
          }}
        />
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={(event, nextView) => {
            if (nextView !== null) {
              setViewMode(nextView);
            }
          }}
        />
        {selectedItems.length > 0 && (
          <Button variant="contained" color="error" onClick={handleDeleteSelected} startIcon={<DeleteOutlined />}>
            Удалить
          </Button>
        )}
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Текущая папка: {currentDirectory || '/'}
      </Typography>

      {isLoading ? (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
              indeterminate={selectedItems.length > 0 && selectedItems.length < allItems.length}
            />
            <Typography variant="h5" sx={{ ml: 1 }}>
              Имя
            </Typography>
          </Stack>
          <Divider />

          {viewMode === 'list' ? (
            <List>
              {/* Отображение папок */}
              {sortedFolders.length > 0 &&
                sortedFolders.map((folder) => (
                  <div key={folder.id}>
                    <ListItem
                      button
                      onClick={() => handleOpenFolder(folder)} // Используем handleOpenFolder здесь
                      selected={isItemSelected(folder)}
                      sx={{
                        bgcolor: isItemSelected(folder) ? 'action.selected' : 'inherit'
                      }}
                    >
                      {/* <Checkbox
                        checked={isItemSelected(folder)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(folder);
                        }}
                        sx={{ marginRight: 2 }}
                      /> */}
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center">
                            <GetFileIcon file={folder} />
                            <Typography variant="body1" sx={{ ml: 1 }}>
                              {folder.name}
                            </Typography>
                          </Stack>
                        }
                        secondary={`Изменен: ${formatDate(folder.createdAt)} | Владелец: ${currentUser?.displayName || 'Неизвестный пользователь'}`}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          {/* Кнопка "Поделиться с группой" или "Закрыть доступ" */}
                          {folder.ownerId === currentUser?.uid && (
                            <>
                              {folder.groupId === null ? (
                                <Tooltip title="Поделиться с группой">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShareFolderToGroup(folder);
                                    }}
                                    color="primary"
                                  >
                                    <ShareAltOutlined />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Закрыть доступ">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnshareFolderFromGroup(folder);
                                    }}
                                    title="Закрыть доступ"
                                    color="secondary"
                                  >
                                    <ShareAltOutlined />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                          {/* Отображение статуса совместного использования */}
                          {folder.groupId !== null && (
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                              Поделено с группой
                            </Typography>
                          )}
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))}

              {/* Отображение файлов */}
              {sortedFiles.length > 0 &&
                sortedFiles.map((file) => (
                  <div key={file.id}>
                    <ListItem
                      button
                      onClick={() => handleSelectItem(file)}
                      selected={isItemSelected(file)}
                      sx={{
                        bgcolor: isItemSelected(file) ? 'action.selected' : 'inherit'
                      }}
                    >
                      <Checkbox
                        checked={isItemSelected(file)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(file);
                        }}
                        sx={{ marginRight: 2 }}
                      />
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center">
                            <GetFileIcon file={file} />
                            <Typography variant="body1" sx={{ ml: 1 }}>
                              {file.name}
                            </Typography>
                          </Stack>
                        }
                        secondary={`Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} | Изменен: ${formatDate(file.last_modified)} | Владелец: ${currentUser?.displayName || 'Неизвестный пользователь'}`}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <IconButton onClick={() => handleDownloadFile(file)}>
                            <DownloadOutlined />
                          </IconButton>
                          <IconButton onClick={() => handleCopyLink(file)}>
                            <LinkOutlined />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))}

              {/* Если нет папок и файлов */}
              {sortedFolders.length === 0 && sortedFiles.length === 0 && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Папки и файлы не найдены
                </Typography>
              )}
            </List>
          ) : (
            // Режим сетки
            <Grid container spacing={2}>
              {/* Отображение папок */}
              {sortedFolders.length > 0 &&
                sortedFolders.map((folder) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: isItemSelected(folder) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        borderRadius: 2,
                        padding: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        backgroundColor: isItemSelected(folder) ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                        '&:hover': {
                          boxShadow: 3
                        },
                        height: '100%'
                      }}
                      onClick={() => handleOpenFolder(folder)} // Используем handleOpenFolder здесь
                    >
                      {/* Checkbox для выбора папки */}
                      <Checkbox
                        checked={isItemSelected(folder)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(folder);
                        }}
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />

                      {/* Иконка и название папки */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GetFileIcon file={folder} />
                        <Typography variant="body1" sx={{ ml: 1, wordBreak: 'break-all' }}>
                          {folder.name}
                        </Typography>
                      </Box>

                      {/* Дополнительная информация */}
                      <Typography variant="caption" color="textSecondary">
                        {`Изменен: ${formatDate(folder.createdAt)}`}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {`Владелец: ${currentUser?.displayName || 'Неизвестный пользователь'}`}
                      </Typography>

                      {/* Действия для папки */}
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {/* Кнопка "Поделиться с группой" или статус */}
                        {folder.groupId === null && folder.ownerId === currentUser?.uid && (
                          <Tooltip title="Поделиться с группой">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation(); // Предотвращаем всплытие события
                                handleShareFolderToGroup(folder);
                              }}
                              title="Поделиться с группой"
                              color="primary"
                            >
                              <ShareAltOutlined />
                            </IconButton>
                          </Tooltip>
                        )}
                        {folder.groupId !== null && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                            Поделено с группой
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                ))}

              {/* Отображение файлов */}
              {sortedFiles.length > 0 &&
                sortedFiles.map((file) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: isItemSelected(file) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        borderRadius: 2,
                        padding: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        backgroundColor: isItemSelected(file) ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                        '&:hover': {
                          boxShadow: 3
                        },
                        height: '100%'
                      }}
                      onClick={() => handleSelectItem(file)} // Выбираем файл при клике
                    >
                      {/* Checkbox для выбора файла */}
                      <Checkbox
                        checked={isItemSelected(file)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(file);
                        }}
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />

                      {/* Иконка и название файла */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GetFileIcon file={file} />
                        <Typography variant="body1" sx={{ ml: 1, wordBreak: 'break-all' }}>
                          {file.name}
                        </Typography>
                      </Box>

                      {/* Дополнительная информация */}
                      <Typography variant="caption" color="textSecondary">
                        {`Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'}`}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {`Изменен: ${formatDate(file.last_modified)}`}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {`Владелец: ${currentUser?.displayName || 'Неизвестный пользователь'}`}
                      </Typography>

                      {/* Действия для файла */}
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file);
                          }}
                          size="small"
                        >
                          <DownloadOutlined />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(file);
                          }}
                          size="small"
                        >
                          <LinkOutlined />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Grid>
                ))}

              {/* Если нет папок и файлов */}
              {sortedFolders.length === 0 && sortedFiles.length === 0 && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Папки и файлы не найдены
                </Typography>
              )}
            </Grid>
          )}
        </>
      )}
    </MainCard>
  );
};

export default FileList;
