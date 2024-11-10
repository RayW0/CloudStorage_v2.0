// src/components/StatusButton.jsx

import React, { useState } from 'react';
import {
  Button,
  Box,
  Menu,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Grow from '@mui/material/Grow';
import { motion } from 'framer-motion';

const statuses = [
  { label: 'Онлайн', color: '#4CAF50' },          // Зеленый
  { label: 'Отошел', color: '#FFC107' },         // Желтый
  { label: 'Не беспокоить', color: '#F44336' },  // Красный
  { label: 'Оффлайн', color: '#9E9E9E' },         // Серый
];

function StatusButton({ initialStatus = 'Оффлайн', onStatusChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(
    statuses.find((status) => status.label === initialStatus) || statuses[3]
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (status) => {
    setCurrentStatus(status);
    handleClose();
    setSnackbarOpen(true);

    // Вызов функции обновления статуса (например, обновление в базе данных)
    if (onStatusChange) {
      onStatusChange(status.label);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        sx={{
          backgroundColor: '#E1F5FE',
          color: 'black',
          textTransform: 'none',
          padding: '8px 12px',
          borderRadius: '16px',
          width: 'fit-content',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#B3E5FC',
            boxShadow: 'none',
          },
        }}
        endIcon={<ArrowDropDownIcon />}
        aria-controls={Boolean(anchorEl) ? 'status-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CircleIcon sx={{ color: currentStatus.color, fontSize: 16 }} />
          </motion.div>
          <Typography variant="body1">{currentStatus.label}</Typography>
        </Box>
      </Button>

      <Menu
        id="status-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        elevation={4}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        TransitionComponent={Grow}
      >
        {statuses.map((status) => (
          <MenuItem
            key={status.label}
            selected={status.label === currentStatus.label}
            onClick={() => handleStatusSelect(status)}
            aria-label={`Выбрать статус ${status.label}`}
          >
            <CircleIcon sx={{ color: status.color, marginRight: 1 }} />
            {status.label}
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%' }}
          variant="filled"
        >
          Статус изменен на "{currentStatus.label}"!
        </Alert>
      </Snackbar>
    </>
  );
}

export default StatusButton;
