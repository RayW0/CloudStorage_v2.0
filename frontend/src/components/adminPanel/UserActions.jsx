// src/components/adminPanel/UserActions.jsx
import React from 'react';
import { Stack, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PropTypes from 'prop-types';

const UserActions = ({ uid, handleDeleteUser, handleBlockUser, handleUnblockUser, isBlocked }) => (
  <Stack direction="row" spacing={2}>
    <Button
      variant="outlined"
      color="error"
      startIcon={<DeleteIcon />}
      onClick={handleDeleteUser}
      disabled={!uid}
    >
      Удалить пользователя
    </Button>
    {isBlocked ? (
      <Button
        variant="outlined"
        color="success"
        startIcon={<LockOpenIcon />}
        onClick={handleUnblockUser}
        disabled={!uid}
      >
        Разблокировать пользователя
      </Button>
    ) : (
      <Button
        variant="outlined"
        color="warning"
        startIcon={<BlockIcon />}
        onClick={handleBlockUser}
        disabled={!uid}
      >
        Заблокировать пользователя
      </Button>
    )}
  </Stack>
);

UserActions.propTypes = {
  uid: PropTypes.string.isRequired,
  handleDeleteUser: PropTypes.func.isRequired,
  handleBlockUser: PropTypes.func.isRequired,
  handleUnblockUser: PropTypes.func.isRequired,
  isBlocked: PropTypes.bool,
};

export default UserActions;
