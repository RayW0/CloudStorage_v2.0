// src/components/adminPanel/UserSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

const UserSelect = ({ uid, setUid, users, disabled }) => (
  <FormControl fullWidth disabled={disabled}>
    <InputLabel id="user-select-label">Пользователь</InputLabel>
    <Select
      labelId="user-select-label"
      value={uid}
      label="Пользователь"
      onChange={(e) => setUid(e.target.value)}
    >
      {Array.isArray(users) && users.map((user) => (
        <MenuItem key={user.uid} value={user.uid}>
          {user.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

UserSelect.propTypes = {
  uid: PropTypes.string.isRequired,
  setUid: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
};

export default UserSelect;
