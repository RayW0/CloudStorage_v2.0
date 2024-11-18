// DashboardDefault.jsx
import { useState, useEffect, useMemo } from 'react';

// project import
import MainCard from 'components/MainCard';
import useUserProfile from 'hooks/useUserProfile';
import DashboardWidget from 'components/Widgets/DashboardWidget';
import WeatherWidget from 'components/Widgets/WeatherWidget';
import FilesWidget from 'components/Widgets/FilesWidget';
import { Grid, Typography, Stack, CircularProgress } from '@mui/material';
import { FileOutlined, UserOutlined } from '@ant-design/icons';
import StatusButton from 'components/StatusButton';
import { CloudOutlined } from '@ant-design/icons';
import useFiles from 'hooks/useFiles';

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const { userName, userStatus } = useUserProfile();
  const [userCount, setUserCount] = useState(0);
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [loadingFiles, setLoadingFiles] = useState(true);

  const { files } = useFiles(currentDirectory);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/get-users');
        const data = await response.json();
        setUserCount(data.users.length);
      } catch (error) {
        console.error('Ошибка при получении количества пользователей:', error);
      }
    };

    fetchUserCount();
  }, []);

  useEffect(() => {
    if (files) {
      setLoadingFiles(false);
    }
  }, [files]);

  // Используем useMemo для мемоизации отсортированных файлов
  const latestFiveFiles = useMemo(() => {
    if (!files) return [];
    return [...files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 5);
  }, [files]);

  return (
    <MainCard sx={{ p: 4 }}>
      {/* Приветственный текст */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
          Добро пожаловать, {userName}!
        </Typography>
        <StatusButton initialStatus={userStatus} />
      </Stack>
      {/* Виджеты */}

      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={12} sm={6} md={3}>
          <WeatherWidget location="Алматы" temperature="7" condition="Cloudy" icon={<CloudOutlined />} link="/home" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Файлы"
            value={files ? files.length : 0}
            icon={<FileOutlined />}
            change={-2.3}
            link="/files"
            extraInfo="Изменение за месяц"
            progress={40}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FilesWidget files={latestFiveFiles} loading={loadingFiles} link="/files" />
        </Grid>
      </Grid>
    </MainCard>
  );
}
