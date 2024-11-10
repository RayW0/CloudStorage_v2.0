// src/components/BreadcrumbsNav.jsx
import React from 'react';
import { Breadcrumbs, Link, Typography, Button } from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';

const BreadcrumbsNav = ({ currentDirectory, onNavigateBack }) => {
  const pathSegments = currentDirectory.split('/').filter(Boolean);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Button
        color="primary"
        onClick={onNavigateBack}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <ArrowLeftOutlined style={{ marginRight: 4 }} />
        Назад
      </Button>
      {/* {pathSegments.map((segment, index) => (
        <Typography key={index} color="textPrimary">
          {segment}
        </Typography> */}
      `{'}'}`
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
