import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/'); // Возвращение на главную страницу или другую безопасную страницу
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
        <LockOutlined sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Доступ запрещён
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          У вас нет прав для доступа к этой странице. Пожалуйста, авторизуйтесь с соответствующими правами.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGoBack} sx={{ mt: 3 }}>
          Вернуться на главную
        </Button>
      </Box>
    </Container>
  );
};

export default NotAuthorized;
