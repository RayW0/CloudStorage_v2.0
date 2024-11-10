// src/components/FileActions.jsx
import React from 'react';
import { Button, Menu, MenuItem, Tooltip } from '@mui/material';
import { PlusCircleOutlined } from '@ant-design/icons';

const FileActions = ({ onUploadClick, onCreateFolderClick }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (action) => {
    setAnchorEl(null);
    if (action === 'upload') {
      onUploadClick();
    } else if (action === 'folder') {
      onCreateFolderClick();
    }
  };

  return (
    <>
      <Tooltip title="New">
        <Button
          variant="outlined"
          aria-label="New"
          size="medium"
          startIcon={<PlusCircleOutlined />}
          onClick={handleMenuClick}
        >
          New
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleMenuClose()}
      >
        <MenuItem onClick={() => handleMenuClose('upload')}>Загрузить файл</MenuItem>
        <MenuItem onClick={() => handleMenuClose('folder')}>Создать папку</MenuItem>
      </Menu>
    </>
  );
};

export default FileActions;
