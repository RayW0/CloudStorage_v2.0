// src/components/adminPanel/ConfirmationDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import PropTypes from 'prop-types';

const ConfirmationDialog = ({
  open,
  title,
  content,
  onClose,
  onConfirm,
  confirmText = 'Да',
  cancelText = 'Нет',
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="confirmation-dialog-title"
    aria-describedby="confirmation-dialog-description"
  >
    <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="confirmation-dialog-description">
        {content}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{cancelText}</Button>
      <Button onClick={onConfirm} autoFocus>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default ConfirmationDialog;
