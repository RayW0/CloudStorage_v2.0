// DashboardDefault.jsx
import { useState, useEffect, useMemo } from 'react';

// project import
import MainCard from 'components/MainCard';
import useUserProfile from 'hooks/useUserProfile';
import DashboardWidget from 'components/Widgets/DashboardWidget';
import WeatherWidget from 'components/Widgets/WeatherWidget';
import FilesWidget from 'components/Widgets/FilesWidget';
import { Grid, Typography, Stack, CircularProgress } from '@mui/material';
import { FileOutlined } from '@ant-design/icons';
import StatusButton from 'components/StatusButton';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import useFiles from 'hooks/useFiles';
import { collection, getCountFromServer } from 'firebase/firestore';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const { userName, userStatus } = useUserProfile();
  const [userCount, setUserCount] = useState(0);
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);


  const { files } = useFiles(currentDirectory);

  useEffect(() => {
    if (files && loadingFiles) {
      setLoadingFiles(false);
    }
  }, [files, loadingFiles]);


  // Используем useMemo для мемоизации отсортированных файлов
  const latestFiveFiles = useMemo(() => {
    if (!files) return [];
    return [...files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 5);
  }, [files]);

  const fetchUserCount = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getCountFromServer(usersCollection);
      setUserCount(snapshot.data().count);
    } catch (error) {
      console.error('Ошибка при получении количества пользователей:', error);
      toast.error('Не удалось получить количество пользователей');
    } finally {
      setLoadingUsers(false);
    }
  };

  

  return (
    <MainCard sx={{ p: 4 }}>
      {/* Приветственный текст */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
          Добро пожаловать, <Typography component="span" sx={{
  background: 'linear-gradient(135deg, #42a5f5 30%, #7986cb 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold', 
  fontSize: '95%'
  
}}>
  {userName}
</Typography><Typography component="span" variant="h3" sx={{
  background: 'linear-gradient(135deg, #42a5f5 30%, #7986cb 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  fontSize: '95%'
}}>!</Typography>
        </Typography>
        <StatusButton initialStatus={userStatus} />
      </Stack>
      {/* Виджеты */}

      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={12} sm={6} md={3}>
          <WeatherWidget location="Алматы" temperature="7" condition="Cloudy" icon={<CloudQueueIcon />} link="/home" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Файлы"
            value={loadingFiles ? <CircularProgress size={24} /> : files.length}
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
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Пользователи"
            value={ 2 }
            icon={<PermIdentityIcon />}
            link="/#"
          />
        </Grid>
      </Grid>
    </MainCard>
  );
}
