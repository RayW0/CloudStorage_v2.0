// src/components/FileListView.jsx

import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Checkbox, ListItemSecondaryAction, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import getFileIcon from 'src/utils/getFileIcon';

const FileListView = ({ files, selectedFiles, toggleFileSelection, actionButtons }) => {
  return (
    <List>
      {files.length > 0 ? (
        files.map((file) => (
          <ListItem key={file.id} button onClick={() => toggleFileSelection(file)}>
            <Checkbox
              edge="start"
              checked={selectedFiles.some((f) => f.id === file.id)}
              tabIndex={-1}
              disableRipple
              onChange={() => toggleFileSelection(file)}
              onClick={(e) => e.stopPropagation()}
            />
            <ListItemIcon>{getFileIcon(file)}</ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={`Размер: ${file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} | Удален: ${
                file.deletedAt
                  ? file.deletedAt instanceof Date
                    ? file.deletedAt.toLocaleString()
                    : new Date(file.deletedAt.seconds * 1000).toLocaleString()
                  : '—'
              }`}
            />
            {actionButtons && <ListItemSecondaryAction>{actionButtons(file)}</ListItemSecondaryAction>}
          </ListItem>
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Файлы не найдены
        </Typography>
      )}
    </List>
  );
};

FileListView.propTypes = {
  files: PropTypes.array.isRequired,
  selectedFiles: PropTypes.array.isRequired,
  toggleFileSelection: PropTypes.func.isRequired,
  actionButtons: PropTypes.func
};

export default FileListView;
