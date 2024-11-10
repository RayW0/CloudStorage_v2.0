// src/components/UserSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { Person } from '@mui/icons-material';

const UserSelect = ({ uid, setUid, users, disabled }) => (
  <FormControl fullWidth variant="outlined">
    <InputLabel id="user-label">Пользователь</InputLabel>
    <Select
      labelId="user-label"
      value={uid}
      onChange={(e) => setUid(e.target.value)}
      label="Пользователь"
      startAdornment={<Person />}
      disabled={disabled}
    >
      {users.length > 0 ? users.map((user) => (
        <MenuItem key={user.uid} value={user.uid}>
          {user.displayName || user.email} {user.isBlocked ? "(Заблокирован)" : ""}
        </MenuItem>
      )) : (
        <MenuItem disabled>Нет пользователей</MenuItem>
      )}
    </Select>
  </FormControl>
);

export default UserSelect;
