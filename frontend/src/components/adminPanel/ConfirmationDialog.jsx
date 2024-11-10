// src/components/ConfirmationDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const ConfirmationDialog = ({ open, title, content, onClose, onConfirm, confirmText, cancelText }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{content}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        {cancelText || 'Отмена'}
      </Button>
      <Button onClick={onConfirm} color="primary">
        {confirmText || 'Подтвердить'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
