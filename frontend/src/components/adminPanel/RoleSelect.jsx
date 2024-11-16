// src/components/adminPanel/RoleSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

const RoleSelect = ({ role, setRole, disabled }) => (
  <FormControl fullWidth disabled={disabled}>
    <InputLabel id="role-select-label">Роль</InputLabel>
    <Select labelId="role-select-label" value={role} label="Роль" onChange={(e) => setRole(e.target.value)}>
      <MenuItem value="admin">Администратор</MenuItem>
      <MenuItem value="user">Пользователь</MenuItem>
    </Select>
  </FormControl>
);

RoleSelect.propTypes = {
  role: PropTypes.string.isRequired,
  setRole: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default RoleSelect;
