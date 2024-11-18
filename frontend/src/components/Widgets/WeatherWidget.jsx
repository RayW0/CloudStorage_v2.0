// src/components/WeatherWidget.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { CardContent, Typography, Stack, Grow, useTheme, Box, Avatar, CardActions, Button } from '@mui/material';
import { CloudOutlined, InfoOutlined } from '@ant-design/icons';
import MainCard from '../MainCard';

/**
 * WeatherWidget - Улучшенный виджет для отображения погоды на главной странице
 *
 * @param {string} location - Название локации
 * @param {number} temperature - Температура в градусах Цельсия
 * @param {string} condition - Текущие погодные условия
 * @param {string} icon - Иконка для отображения погодного условия
 * @param {string} link - Путь для навигации при клике
 */
export default function WeatherWidget({ location, temperature, condition, icon, link }) {
  const theme = useTheme();

  return (
    <Grow in>
      <MainCard
        sx={{
          minWidth: { xs: '100%', sm: 275 },
          maxWidth: 350,
          mb: 3,
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8]
          },
          borderRadius: 4,
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.dark} 90%)`,
          color: theme.palette.common.white,
          overflow: 'hidden'
        }}
        onClick={() => window.open(link, '_blank')}
        elevation={3}
      >
        <CardContent>
          <Stack direction="column" spacing={2} alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: theme.palette.common.white,
                  color: theme.palette.primary.main,
                  width: 56,
                  height: 56,
                  boxShadow: theme.shadows[2]
                }}
              >
                {icon || <CloudOutlined style={{ fontSize: 28 }} />}
              </Avatar>
              <Stack spacing={0.5}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {location}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {temperature}&deg;C
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                  {condition}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', paddingRight: 2, paddingBottom: 1 }}>
          <Button
            size="small"
            sx={{
              color: theme.palette.common.white,
              borderColor: theme.palette.common.white,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            variant="outlined"
            onClick={() => window.open(link, '_blank')}
          >
            Подробнее
          </Button>
        </CardActions>
      </MainCard>
    </Grow>
  );
}

WeatherWidget.propTypes = {
  location: PropTypes.string.isRequired,
  temperature: PropTypes.number.isRequired,
  condition: PropTypes.string.isRequired,
  icon: PropTypes.node,
  link: PropTypes.string // путь для навигации
};

WeatherWidget.defaultProps = {
  icon: <CloudOutlined />,
  link: '/'
};
