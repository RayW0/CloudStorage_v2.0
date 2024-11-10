// src/components/UserActions.jsx
import React from 'react';
import { Stack, Button } from '@mui/material';
import { DeleteOutline, Block, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';

const UserActions = ({
  uid,
  handleDeleteUser,
  handleBlockUser,
  handleUnblockUser,
  isBlocked,
}) => {
  return (
    <Stack direction="row" spacing={2}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteOutline />}
        onClick={handleDeleteUser}
        disabled={!uid}
      >
        Удалить пользователя
      </Button>

      {isBlocked ? (
        <Button
          variant="outlined"
          color="success"
          startIcon={<CheckCircle />}
          onClick={handleUnblockUser}
          disabled={!uid}
        >
          Разблокировать пользователя
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Block />}
          onClick={handleBlockUser}
          disabled={!uid}
        >
          Заблокировать пользователя
        </Button>
      )}
    </Stack>
  );
};

export default UserActions;
