// src/components/ViewModeToggle.jsx
import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={onViewModeChange}
      aria-label="view mode"
      size="small"
    >
      <ToggleButton value="list" aria-label="list view">
        <UnorderedListOutlined />
      </ToggleButton>
      <ToggleButton value="grid" aria-label="grid view">
        <AppstoreOutlined />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewModeToggle;
