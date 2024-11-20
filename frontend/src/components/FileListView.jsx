// src/components/FileListView.jsx

import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Stack,
  Divider,
  Checkbox,
  Tooltip
} from '@mui/material';
import { DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import GetFileIcon from '../utils/getFileIcon';
import RestoreFromTrashOutlined from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlined from '@mui/icons-material/DeleteForeverOutlined';

const FileListView = ({ files, selectedIds, toggleSelection, isFolder = false }) => {
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
    <List>
      {files.map((file) => (
        <div key={file.id}>
          <ListItem
            button
            onClick={() => toggleSelection(file.id)}
            selected={selectedIds.includes(file.id)}
            sx={{
              bgcolor: selectedIds.includes(file.id) ? 'action.selected' : 'inherit'
            }}
          >
            <Checkbox
              checked={selectedIds.includes(file.id)}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(file.id);
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
              secondary={
                isFolder
                  ? `Изменён: ${formatDate(file.createdAt)} | Владелец: ${file.ownerId}`
                  : `Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} | Изменён: ${formatDate(file.last_modified)} | Владелец: ${file.ownerId}`
              }
            />
            <ListItemSecondaryAction>
              <Stack direction="row" spacing={1}>
                {!isFolder ? (
                  <>
                    <Tooltip title="Скачать">
                      <IconButton onClick={() => file.downloadURL && window.open(file.downloadURL, '_blank')}>
                        <DownloadOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Скопировать ссылку">
                      <IconButton onClick={() => navigator.clipboard.writeText(file.downloadURL)}>
                        <LinkOutlined />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Восстановить">
                      <IconButton onClick={() => toggleSelection(file.id)}>
                        <RestoreFromTrashOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить окончательно">
                      <IconButton onClick={() => toggleSelection(file.id)}>
                        <DeleteForeverOutlined />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </div>
      ))}

      {/* Если нет элементов */}
      {files.length === 0 && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Нет элементов для отображения
        </Typography>
      )}
    </List>
  );
};

export default FileListView;
