// src/components/AdminPanel.jsx

import React, { useState } from 'react';
import {
  Button,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem
} from '@mui/material';
import useAdminPanel from 'hooks/useAdminPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {
  const {
    uid,
    setUid,
    role,
    setRole,
    groupId,
    setGroupId,
    users,
    groups,
    newGroupName,
    setNewGroupName,
    groupMembers,
    setGroupMembers,
    handleToggleMember,
    isLoading,
    handleAssignRole,
    handleAssignGroups,
    handleCreateGroup,
    handleDeleteGroup,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser,
    handleRemoveUserFromGroup
  } = useAdminPanel();

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(''); // Новое состояние для выбранной группы

  const handleGroupChange = (event) => {
    const {
      target: { value }
    } = event;
    setSelectedGroups(typeof value === 'string' ? value.split(',') : value);
    setGroupMembers(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Card sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
      <CardContent>
        <Typography variant="h4" gutterBottom align="center">
          Админ панель
        </Typography>

        {/* Назначение групп пользователю */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="assign-groups-label">Выберите группы</InputLabel>
          <Select
            labelId="assign-groups-label"
            multiple
            value={selectedGroups}
            onChange={handleGroupChange}
            input={<OutlinedInput label="Выберите группы" />}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const group = groups.find((g) => g.id === id);
                  return group ? group.name : id;
                })
                .join(', ')
            }
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                <Checkbox checked={selectedGroups.indexOf(group.id) > -1} />
                <ListItemText primary={group.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleAssignGroups} disabled={isLoading || selectedGroups.length === 0 || !uid} sx={{ mb: 4 }}>
          Назначить выбранные группы
        </Button>

        {/* Создание новой группы */}
        <Typography variant="h6" gutterBottom>
          Создать новую группу
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Название новой группы"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              onClick={handleCreateGroup}
              disabled={isLoading || !newGroupName.trim() || groupMembers.length === 0}
            >
              Создать группу
            </Button>
          </Grid>
        </Grid>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="create-group-members-label">Выберите участников</InputLabel>
          <Select
            labelId="create-group-members-label"
            multiple
            value={groupMembers}
            onChange={(e) => setGroupMembers(e.target.value)}
            input={<OutlinedInput label="Выберите участников" />}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const user = users.find((u) => u.uid === id);
                  return user ? user.displayName || user.username : id;
                })
                .join(', ')
            }
          >
            {users.map((user) => (
              <MenuItem key={user.uid} value={user.uid}>
                <Checkbox checked={groupMembers.indexOf(user.uid) > -1} />
                <ListItemText primary={user.displayName || user.username} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Отображение списка групп */}
        <Typography variant="h6" gutterBottom>
          Список групп:
        </Typography>
        {groups.map((group) => (
          <Box key={group.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              {group.name}
            </Typography>
            <Button variant="outlined" color="error" onClick={() => handleDeleteGroup(group.id)}>
              Удалить
            </Button>
          </Box>
        ))}

        {/* Отображение списка пользователей */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Список пользователей:
        </Typography>
        {users.map((user) => (
          <Box key={user.uid} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              {user.displayName || user.username} ({user.email})
            </Typography>
            <Button variant="outlined" color="secondary" onClick={() => setUid(user.uid)} sx={{ mr: 1 }}>
              Управлять
            </Button>
          </Box>
        ))}

        {/* Выпадающий список для выбора группы и отображения пользователей в ней */}
        <FormControl fullWidth sx={{ mt: 4, mb: 3 }}>
          <InputLabel id="view-group-users-label">Выберите группу для просмотра пользователей</InputLabel>
          <Select
            labelId="view-group-users-label"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            input={<OutlinedInput label="Выберите группу для просмотра пользователей" />}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedGroupId && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Пользователи в группе: {groups.find((g) => g.id === selectedGroupId)?.name}
            </Typography>
            {users.filter((user) => Array.isArray(user.groups) && user.groups.includes(selectedGroupId)).length > 0 ? (
              <List>
                {users
                  .filter((user) => Array.isArray(user.groups) && user.groups.includes(selectedGroupId))
                  .map((user) => (
                    <ListItem key={user.uid}>
                      <ListItemText primary={`${user.displayName || user.username} (${user.email})`} />
                      {/* Добавьте дополнительные действия, если необходимо */}
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography>В данной группе нет пользователей.</Typography>
            )}
          </Box>
        )}

        {/* Управление выбранным пользователем */}
        {uid && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Управление пользователем
            </Typography>
            <CardActions>
              <Button variant="contained" color="error" onClick={handleDeleteUser} disabled={isLoading}>
                Удалить пользователя
              </Button>
              <Button variant="contained" color="warning" onClick={handleBlockUser} disabled={isLoading} sx={{ ml: 2 }}>
                Заблокировать пользователя
              </Button>
              <Button variant="contained" color="success" onClick={handleUnblockUser} disabled={isLoading} sx={{ ml: 2 }}>
                Разблокировать пользователя
              </Button>
            </CardActions>
          </Box>
        )}
      </CardContent>

      {/* Контейнер для уведомлений */}
      <ToastContainer />
    </Card>
  );
};

export default AdminPanel;
