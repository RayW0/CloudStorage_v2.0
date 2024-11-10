// src/components/CreateGroupForm.jsx
import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

const CreateGroupForm = ({ newGroupName, setNewGroupName, handleCreateGroup }) => (
  <Stack direction="row" spacing={2}>
    <TextField
      label="Название новой группы"
      variant="outlined"
      value={newGroupName}
      onChange={(e) => setNewGroupName(e.target.value)}
      fullWidth
    />
    <Button
      variant="contained"
      color="success"
      startIcon={<AddCircleOutline />}
      onClick={handleCreateGroup}
      disabled={!newGroupName}
    >
      Создать
    </Button>
  </Stack>
);

export default CreateGroupForm;
