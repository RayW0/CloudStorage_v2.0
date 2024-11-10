// src/components/GroupSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Group } from '@mui/icons-material';

const GroupSelect = ({ groupId, setGroupId, groups, disabled }) => (
  <FormControl fullWidth variant="outlined">
    <InputLabel id="group-label">Группа</InputLabel>
    <Select
      labelId="group-label"
      value={groupId}
      onChange={(e) => setGroupId(e.target.value)}
      label="Группа"
      startAdornment={<Group />}
      disabled={disabled}
    >
      {groups.length > 0 ? groups.map((group) => (
        <MenuItem key={group.id} value={group.id}>
          {group.name}
        </MenuItem>
      )) : (
        <MenuItem disabled>Нет групп</MenuItem>
      )}
    </Select>
  </FormControl>
);

export default GroupSelect;
