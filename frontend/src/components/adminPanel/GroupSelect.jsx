// src/components/adminPanel/GroupSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

const GroupSelect = ({ groupId, setGroupId, groups, disabled }) => (
  <FormControl fullWidth disabled={disabled}>
    <InputLabel id="group-select-label">Группа</InputLabel>
    <Select
      labelId="group-select-label"
      value={groupId}
      label="Группа"
      onChange={(e) => setGroupId(e.target.value)}
    >
      {Array.isArray(groups) && groups.map((group) => (
        <MenuItem key={group.id} value={group.id}>
          {group.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

GroupSelect.propTypes = {
  groupId: PropTypes.string.isRequired,
  setGroupId: PropTypes.func.isRequired,
  groups: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
};

export default GroupSelect;
