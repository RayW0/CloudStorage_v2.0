// src/components/FileListView.jsx

import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Checkbox, Stack } from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import getFileIcon from 'utils/getFileIcon';

const FileListView = ({ files, selectedFiles, toggleFileSelection, actionButtons, isFolder = false }) => {
  return (
    <List>
      {files.map((item) => (
        <ListItem key={item.id}>
          <Checkbox checked={selectedFiles.some((f) => f.id === item.id)} onChange={() => toggleFileSelection(item)} />
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center">
                {isFolder ? <FolderOutlinedIcon style={{ marginRight: 8 }} /> : getFileIcon(item)}
                <Typography variant="body1">{item.name}</Typography>
              </Stack>
            }
            secondary={
              isFolder
                ? `Удалён: ${item.deletedAt ? new Date(item.deletedAt).toLocaleString() : 'Неизвестно'} | Размер: ${item.size ? (item.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'}`
                : `Размер: ${item.size ? (item.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} | Удалён: ${item.deletedAt ? new Date(item.deletedAt).toLocaleString() : 'Неизвестно'}`
            }
          />
          <ListItemSecondaryAction>{actionButtons(item)}</ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default FileListView;
