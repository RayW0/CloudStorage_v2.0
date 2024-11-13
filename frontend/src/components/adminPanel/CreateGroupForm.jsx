// src/components/adminPanel/CreateGroupForm.jsx
import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import PropTypes from 'prop-types';

const CreateGroupForm = ({
  newGroupName,
  setNewGroupName,
  handleCreateGroup,
}) => (
  <Stack spacing={3}>
    {/* Поле ввода названия группы */}
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
  </Stack>
);

CreateGroupForm.propTypes = {
  newGroupName: PropTypes.string.isRequired,
  setNewGroupName: PropTypes.func.isRequired,
  handleCreateGroup: PropTypes.func.isRequired,
};

export default CreateGroupForm;
