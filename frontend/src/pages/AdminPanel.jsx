import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Stack,
  Box,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainCard from 'components/MainCard';
import UserSelect from 'components/adminPanel/UserSelect';
import RoleSelect from 'components/adminPanel/RoleSelect';
import GroupSelect from 'components/adminPanel/GroupSelect';
import CreateGroupForm from 'components/adminPanel/CreateGroupForm';
import GroupsList from 'components/adminPanel/GroupsList';
import UserActions from 'components/adminPanel/UserActions';
import ConfirmationDialog from 'components/adminPanel/ConfirmationDialog';
import useAdminPanel from '../hooks/useAdminPanel';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { currentUser, isLoading: authIsLoading, token } = useAuth();
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
    isLoading,
    handleAssignRole,
    handleAssignGroup,
    handleCreateGroup,
    handleDeleteGroup,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser,
    handleRemoveUserFromGroup,
  } = useAdminPanel();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);

  useEffect(() => {
    // Проверка на наличие токена и текущего пользователя
    if (!authIsLoading && (!currentUser || !token)) {
      toast.error('Вы не авторизованы. Пожалуйста, войдите в систему.');
      navigate('/login');
    }
  }, [authIsLoading, currentUser, token, navigate]);

  useEffect(() => {
    console.log('groupMembers:', groupMembers);
  }, [groupMembers]);

  if (authIsLoading || !token || !currentUser) {
    // Показать индикатор загрузки или сообщение, если пользователь не авторизован
    return (
      <MainCard style={{ padding: '30px', maxWidth: '800px', margin: '2% auto' }}>
        <Typography variant="h5" align="center">
          Загрузка...
        </Typography>
      </MainCard>
    );
  }

  return (
    <MainCard style={{ padding: '30px', maxWidth: '800px', margin: '2% auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Панель администратора
      </Typography>

      <Stack spacing={3} mt={2}>
        {/* Селектор Пользователя */}
        <UserSelect uid={uid} setUid={setUid} users={users} disabled={isLoading} />

        {/* Селектор Роли */}
        <RoleSelect role={role} setRole={setRole} disabled={isLoading || !uid} />

        {/* Кнопка Назначения Роли */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircle />}
          fullWidth
          onClick={handleAssignRole}
          disabled={isLoading || !uid || !role}
        >
          Назначить роль
        </Button>

        {/* Селектор Группы */}
        <GroupSelect groupId={groupId} setGroupId={setGroupId} groups={groups} disabled={isLoading || !uid} />

        {/* Кнопка Назначения Группы */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircle />}
          fullWidth
          onClick={handleAssignGroup}
          disabled={isLoading || !uid || !groupId}
        >
          Назначить группу
        </Button>

        {/* Поле для создания новой группы */}
        <Box sx={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>
            Создать новую группу
          </Typography>
          <CreateGroupForm
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            handleCreateGroup={() => handleCreateGroup(newGroupName, groupMembers)}
          />

          {/* Выбор участников группы */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Выберите участников группы:
            </Typography>
            <Select
              multiple
              value={groupMembers}
              onChange={(e) => setGroupMembers(e.target.value)}
              renderValue={(selected) =>
                users
                  .filter((user) => selected.includes(user.uid))
                  .map((user) => user.username)
                  .join(', ')
              }
            >
              {users.map((user) => (
                <MenuItem key={user.uid} value={user.uid}>
                  <Checkbox checked={groupMembers.includes(user.uid)} />
                  <ListItemText primary={user.username} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Отображение списка групп с возможностью удаления и управления участниками */}
        <GroupsList
          groups={groups}
          handleDeleteGroup={handleDeleteGroup}
          handleRemoveUserFromGroup={handleRemoveUserFromGroup}
          users={users} // Передаем список пользователей для отображения имен
        />

        {/* Кнопки управления пользователями */}
        <UserActions
          uid={uid}
          handleDeleteUser={() => setDeleteDialogOpen(true)}
          handleBlockUser={() => setBlockDialogOpen(true)}
          handleUnblockUser={() => setUnblockDialogOpen(true)}
          isBlocked={users.find((user) => user.uid === uid)?.isBlocked}
        />
      </Stack>

      {/* Диалоги подтверждения */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Подтверждение удаления"
        content="Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить."
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        confirmText="Удалить"
        cancelText="Отмена"
      />

      <ConfirmationDialog
        open={blockDialogOpen}
        title="Подтверждение блокировки"
        content="Вы уверены, что хотите заблокировать этого пользователя?"
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockUser}
        confirmText="Заблокировать"
        cancelText="Отмена"
      />

      <ConfirmationDialog
        open={unblockDialogOpen}
        title="Подтверждение разблокировки"
        content="Вы уверены, что хотите разблокировать этого пользователя?"
        onClose={() => setUnblockDialogOpen(false)}
        onConfirm={handleUnblockUser}
        confirmText="Разблокировать"
        cancelText="Отмена"
      />
    </MainCard>
  );
}
