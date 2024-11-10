
// src/components/FileList.jsx
import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, IconButton,
  Typography, Stack, Divider, Button, MenuItem, Select, FormControl, Checkbox,
  CircularProgress, Menu, Avatar, Grid, ToggleButtonGroup, ToggleButton, Box
} from '@mui/material';
import {
  DownloadOutlined, DeleteOutlined, PlusCircleOutlined, FolderOutlined, ArrowLeftOutlined, LinkOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { toast } from 'react-toastify';

import BreadcrumbsNav from 'components/@extended/BreadcrumbsNav';
import SortControls from 'components/@extended/SortControls';
import FileActions from 'components/files/FileActions';
import ViewModeToggle from 'components/@extended/ViewModeToggle';
import SimpleDropdown from 'components/Dropdown';
import useFiles from 'hooks/useFiles';
import useSort from 'hooks/useSort';

const FileList = () => {
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [viewMode, setViewMode] = useState('list'); // 'list' или 'grid'

  const {
    files,
    isLoading,
    handleDeleteFiles,
    handleUploadFile,
    handleDownloadFile,
    handleCopyLink,
    handleCreateFolder,
    currentUser
  } = useFiles(currentDirectory);

  const sortedFiles = useSort(files, sortField, sortOrder);

  const handleSortFieldChange = (event) => {
    setSortField(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleDeleteSelected = () => {
    handleDeleteFiles(selectedFiles);
    setSelectedFiles([]);
    setSelectAll(false);
  };

  const handleSelectFile = (file) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(file)) {
        return prevSelectedFiles.filter((f) => f !== file);
      } else {
        return [...prevSelectedFiles, file];
      }
    });
  };

  const isFileSelected = (file) => selectedFiles.includes(file);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files);
    }
    setSelectAll(!selectAll);
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return <FolderOutlined style={{ fontSize: 24 }} />;
    }
    const extension = file.name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <Avatar
            variant="square"
            src={file.downloadURL}
            alt={file.name}
            sx={{ width: 24, height: 24, mr: 1 }}
          />
        );
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 24 }} />;
      case 'zip':
      case 'rar':
        return <FileZipOutlined style={{ fontSize: 24 }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: 24 }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: 24 }} />;
      case 'txt':
        return <FileTextOutlined style={{ fontSize: 24 }} />;
      default:
        return <FileOutlined style={{ fontSize: 24 }} />;
    }
  };

  const handleNavigateBack = () => {
    const paths = currentDirectory.split('/').filter(p => p);
    paths.pop();
    const newPath = `/${paths.join('/')}${paths.length > 0 ? '/' : ''}`;
    setCurrentDirectory(newPath);
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
            const folderName = prompt("Введите имя новой папки:");
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
        {selectedFiles.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            startIcon={<DeleteOutlined />}
          >
            Удалить
          </Button>
        )}
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Текущая папка: {currentDirectory}
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
              indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
            />
            <Typography variant="h5" sx={{ ml: 1 }}>
              Имя файла
            </Typography>
          </Stack>
          <Divider />

          {viewMode === 'list' ? (
            <List>
              {sortedFiles.length > 0 ? (
                sortedFiles.map((file) => (
                  <div key={file.id}>
                    <ListItem
                      button
                      onClick={() => {
                        if (file.type === 'folder') {
                          setCurrentDirectory(`${currentDirectory}${file.name}/`);
                        } else {
                          handleSelectFile(file);
                        }
                      }}
                      selected={isFileSelected(file)}
                      sx={{
                        bgcolor: isFileSelected(file) ? 'action.selected' : 'inherit',
                      }}
                    >
                      <Checkbox
                        checked={isFileSelected(file)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFile(file);
                        }}
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
                        secondary={`Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} | Изменен: ${new Date(file.last_modified).toLocaleString()} | Владелец: ${currentUser?.displayName || "Неизвестный пользователь"}`}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          {file.type !== 'folder' && (
                            <>
                              <IconButton onClick={() => handleDownloadFile(file)}>
                                <DownloadOutlined />
                              </IconButton>
                              <IconButton onClick={() => handleCopyLink(file)}>
                                <LinkOutlined />
                              </IconButton>
                            </>
                          )}
                          <SimpleDropdown file={file} />
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Файлы не найдены
                </Typography>
              )}
            </List>
          ) : (
            // Режим сетки
            <Grid container spacing={2}>
              {sortedFiles.length > 0 ? (
                sortedFiles.map((file) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: isFileSelected(file) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        borderRadius: 2,
                        padding: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        backgroundColor: isFileSelected(file) ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                        '&:hover': {
                          boxShadow: 3,
                        },
                        height: '100%',
                      }}
                      onClick={() => {
                        if (file.type === 'folder') {
                          setCurrentDirectory(`${currentDirectory}${file.name}/`);
                        } else {
                          handleSelectFile(file);
                        }
                      }}
                    >
                      {/* Checkbox для выбора файла */}
                      <Checkbox
                        checked={isFileSelected(file)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFile(file);
                        }}
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />

                      {/* Контейнер для иконки и текста */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getFileIcon(file)}
                        <Typography variant="body1" sx={{ ml: 1, wordBreak: 'break-all' }}>
                          {file.name}
                        </Typography>
                      </Box>

                      {/* Для папок показываем только иконку и имя */}
                      {file.type === 'folder' ? null : (
                        <>
                          {/* Дополнительная информация для файлов */}
                          <Typography variant="caption" color="textSecondary">
                            {`Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {`Изменен: ${new Date(file.last_modified).toLocaleString()}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {`Владелец: ${currentUser?.displayName || "Неизвестный пользователь"}`}
                          </Typography>

                          {/* Действия для файлов (скачать, копировать ссылку) */}
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
                            <SimpleDropdown file={file} />
                          </Stack>
                        </>
                      )}
                    </Box>
                  </Grid>
                ))
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Файлы не найдены
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
