// src/components/RoleSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Group } from '@mui/icons-material';

const RoleSelect = ({ role, setRole, disabled }) => (
  <FormControl fullWidth variant="outlined">
    <InputLabel id="role-label">Роль</InputLabel>
    <Select
      labelId="role-label"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      label="Роль"
      startAdornment={<Group />}
      disabled={disabled}
    >
      <MenuItem value="admin">Администратор</MenuItem>
      <MenuItem value="user">Пользователь</MenuItem>
      <MenuItem value="moderator">Модератор</MenuItem>
    </Select>
  </FormControl>
);

export default RoleSelect;
