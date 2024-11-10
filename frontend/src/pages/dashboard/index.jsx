import { useState, useEffect } from 'react';

// project import
import MainCard from 'components/MainCard';
import useUserProfile from 'hooks/useUserProfile';
import DashboardWidget from 'components/DashboardWidget';
import { Grid, Typography, Stack } from '@mui/material';
import { FileOutlined, UserOutlined } from '@ant-design/icons';
import StatusButton from 'components/StatusButton';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';

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
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Пользователи"
            value={userCount}
            icon={<UserOutlined />}
            change={5.4}
            link="/users"
            extraInfo="Всего пользователей"
            progress={75}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget
            title="Файлы"
            value="0"
            icon={<FileOutlined />}
            change={-2.3}
            link="/files"
            extraInfo="Изменение за месяц"
            progress={40}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
}
