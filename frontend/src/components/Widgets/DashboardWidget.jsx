// src/components/DashboardWidget.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CardContent, Typography, Stack, Grow, useTheme, Box, Avatar, CardActions, Button, LinearProgress } from '@mui/material';
import { FileOutlined, ArrowUpOutlined, ArrowDownOutlined, InfoOutlined } from '@ant-design/icons';
import MainCard from '../MainCard';

/**
 * DashboardWidget - Улучшенный виджет с новым дизайном для отображения информации на главной странице
 *
 * @param {string} title - Заголовок виджета
 * @param {string|number} value - Основное значение для отображения
 * @param {React.Node} icon - Иконка для отображения
 * @param {number} change - Процент изменения значения
 * @param {string} link - Путь для навигации при клике
 * @param {string} extraInfo - Дополнительная информация для отображения
 * @param {number} progress - Значение прогресса (от 0 до 100)
 */
export default function DashboardWidget({ title, value, icon, change, link, extraInfo, progress }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const isPositive = change > 0;
  const changeColor = isPositive ? theme.palette.success.main : theme.palette.error.main;

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
          background: `linear-gradient(135deg, #ffffff 0%, #42a5f5 100%)`,
          color: theme.palette.text.primary,
          overflow: 'hidden'
        }}
        onClick={() => navigate(link)}
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
                {icon || <FileOutlined style={{ fontSize: 28, color: theme.palette.primary.main }} />}
              </Avatar>
              <Stack spacing={0.5}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, lineHeight: 1.2 }}>
                  {value}
                </Typography>
              </Stack>
            </Stack>

            {typeof change === 'number' && (
              <Stack direction="row" alignItems="center" spacing={1}>
                {isPositive ? <ArrowUpOutlined style={{ color: changeColor }} /> : <ArrowDownOutlined style={{ color: changeColor }} />}
                <Typography variant="body2" sx={{ color: changeColor, fontWeight: 'medium' }}>
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {isPositive ? 'увеличение' : 'уменьшение'}
                </Typography>
              </Stack>
            )}

            {progress !== undefined && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.palette.grey[100],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary
                    }
                  }}
                />
                <Typography
                  variant="body
                2"
                  sx={{ mt: 1, color: theme.palette.text.secondary }}
                >
                  Завершено: {progress}%
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', paddingRight: 2, paddingBottom: 1 }}>
          <Button
            size="small"
            sx={{
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 255, 0.05)'
              }
            }}
            variant="outlined"
            onClick={() => navigate(link)}
          >
            Подробнее
          </Button>
        </CardActions>
      </MainCard>
    </Grow>
  );
}

DashboardWidget.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  change: PropTypes.number, // процент изменения
  link: PropTypes.string, // путь для навигации
  extraInfo: PropTypes.string, // дополнительная информация
  progress: PropTypes.number // значение прогресса (0-100)
};

DashboardWidget.defaultProps = {
  icon: <FileOutlined />,
  change: 0,
  link: '/files',
  extraInfo: '',
  progress: undefined
};
