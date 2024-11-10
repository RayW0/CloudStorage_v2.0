// src/components/DashboardWidget.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CardContent, Typography, Stack, Tooltip, LinearProgress, Grow, useTheme, Box, Badge } from '@mui/material';
import { FileOutlined, ArrowUpOutlined, ArrowDownOutlined, UserOutlined, DollarOutlined, InfoOutlined } from '@ant-design/icons';
import MainCard from './MainCard'; // Предполагается, что MainCard настроен для использования с MUI
import { styled } from '@mui/system';

/**
 * StyledBadge - Настроенный компонент Badge для отображения статуса
 */
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px'
  }
}));

/**
 * DashboardWidget - Улучшенный виджет для отображения информации на главной странице
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
  const valueColor =
    typeof value === 'number' ? (value >= 0 ? theme.palette.success.main : theme.palette.error.main) : theme.palette.text.primary;

  const iconColor = theme.palette.mode === 'dark' ? '#fff' : '#1890ff';

  return (
    <Grow in>
      <MainCard
        sx={{
          minWidth: { xs: '100%', sm: 275 },
          maxWidth: 300,
          mb: 3,
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: theme.shadows[6]
          },
          position: 'relative'
        }}
        onClick={() => navigate(link)}
        elevation={3}
      >
        {/* Индикатор статуса */}
        <StyledBadge
          badgeContent=" "
          variant="dot"
          color={isPositive ? 'success' : 'error'}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        />

        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                fontSize: 50,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon || <FileOutlined />}
            </Box>
            <Stack spacing={1} flex={1}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                {title}
                <Tooltip title="Информация о виджете">
                  <InfoOutlined style={{ marginLeft: 4, fontSize: '16px', cursor: 'pointer' }} />
                </Tooltip>
              </Typography>
              <Tooltip title="Обновлено 5 минут назад">
                <Typography variant="h4" sx={{ color: valueColor, fontWeight: 'bold' }}>
                  {value}
                </Typography>
              </Tooltip>
              {typeof change === 'number' && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {isPositive ? <ArrowUpOutlined style={{ color: changeColor }} /> : <ArrowDownOutlined style={{ color: changeColor }} />}
                  <Typography variant="body2" sx={{ color: changeColor, fontWeight: 'medium' }}>
                    {Math.abs(change)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isPositive ? 'увеличение' : 'уменьшение'}
                  </Typography>
                </Stack>
              )}
              {progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      backgroundColor: theme.palette.grey[300],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.primary.main
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Завершено: {progress}%
                  </Typography>
                </Box>
              )}
              {extraInfo && (
                <Typography variant="body2" color="text.secondary">
                  {extraInfo}
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
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
  link: '/',
  extraInfo: '',
  progress: undefined
};
