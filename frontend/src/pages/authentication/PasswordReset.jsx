// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import AuthWrapper from './AuthWrapper';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Ссылка для восстановления пароля отправлена на ваш email.');
    } catch (err) {
      setError('Не удалось отправить ссылку для восстановления. Проверьте email и попробуйте снова.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3} justifyContent="center">
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                  Восстановление пароля
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Введите ваш email, и мы отправим ссылку для восстановления пароля.
                </Typography>
              </Box>
              {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                placeholder="example@domain.com"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </CardContent>
            <CardActions sx={{ flexDirection: 'column', px: 3, pb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleResetPassword}
                disabled={loading || !email.trim()}
                sx={{ borderRadius: 2, boxShadow: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Отправить ссылку'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography
                  component={Link}
                  to="/login"
                  color="primary"
                  sx={{ textDecoration: 'none', fontWeight: 'medium' }}
                >
                  Вернуться к входу
                </Typography>
              </Box>
            </CardActions>
      </Grid>
    </AuthWrapper>
  );
}
