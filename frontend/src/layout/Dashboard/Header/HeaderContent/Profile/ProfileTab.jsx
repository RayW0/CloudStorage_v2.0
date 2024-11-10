import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth'; // Импортируйте необходимые функции
import { auth } from 'firebaseConfig'; // Убедись, что путь к файлу правильный

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export default function ProfileTab() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleListItemClick = (event, index, path) => {
    setSelectedIndex(index);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Используем импортированный `auth`
      navigate('/login'); // Перенаправление на страницу входа после выхода
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>

      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) => handleListItemClick(event, 1, '/user/view-profile')}
      >
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Посмотреть профиль" />
      </ListItemButton>

      <ListItemButton
        selected={selectedIndex === 3}
        onClick={() => {
          setSelectedIndex(3);
          handleLogout(); // Вызов функции выхода из системы
        }}
      >
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Выход" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = {
  handleLogout: PropTypes.func, // Убрали требование обязательности функции для упрощения
};
