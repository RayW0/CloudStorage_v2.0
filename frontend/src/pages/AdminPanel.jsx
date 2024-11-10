// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Stack, Box } from '@mui/material';
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
import useAdminPanel from 'hooks/useAdminPanel';

export default function AdminPanel() {
  const navigate = useNavigate();
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
    isLoading,
    uploading,
    handleAssignRole,
    handleAssignGroup,
    handleCreateGroup,
    handleDeleteGroup,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser
  } = useAdminPanel();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);

  // Проверка наличия токена и перенаправление при его отсутствии
  if (!isLoading && !users.length && !groups.length) {
    toast.error('Токен отсутствует или данные не загружены.');
    navigate('/login');
    return null;
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
        <CreateGroupForm newGroupName={newGroupName} setNewGroupName={setNewGroupName} handleCreateGroup={handleCreateGroup} />

        {/* Отображение списка групп с возможностью удаления */}
        <GroupsList groups={groups} handleDeleteGroup={handleDeleteGroup} />

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
