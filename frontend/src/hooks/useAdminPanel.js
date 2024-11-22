// src/hooks/useAdminPanel.js

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUsers,
  getGroups,
  assignRole,
  assignGroup, // Функция для назначения нескольких групп
  createGroup,
  deleteGroup, // Добавлен импорт функции удаления группы
  removeUserFromGroup,
  deleteUser,
  blockUser,
  unblockUser
} from '../api/adminApi';
import { toast } from 'react-toastify';

const useAdminPanel = () => {
  const { token, isLoading: authIsLoading } = useAuth();
  const [uid, setUid] = useState('');
  const [role, setRole] = useState('');
  const [groupId, setGroupId] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authIsLoading || !token) {
        setIsLoading(true);
        return;
      }

      try {
        const [fetchedUsers, fetchedGroups] = await Promise.all([getUsers(token), getGroups(token)]);
        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        toast.error('Ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, authIsLoading]);

  const handleToggleMember = (groupId) => {
    setGroupMembers((prevSelected) =>
      prevSelected.includes(groupId) ? prevSelected.filter((id) => id !== groupId) : [...prevSelected, groupId]
    );
  };

  const handleAssignRole = async () => {
    if (!uid || !role) {
      toast.error('Выберите пользователя и роль.');
      return;
    }

    try {
      await assignRole(token, uid, role);
      setUsers((prevUsers) => prevUsers.map((user) => (user.uid === uid ? { ...user, role } : user)));
      setUid('');
      setRole('');
      toast.success('Роль успешно назначена');
    } catch (error) {
      console.error('Ошибка при назначении роли:', error);
      toast.error('Ошибка при назначении роли');
    }
  };

  const handleAssignGroups = async () => {
    if (!uid || groupMembers.length === 0) {
      toast.error('Выберите пользователя и группы.');
      return;
    }

    try {
      await assignGroup(token, uid, groupMembers); // Назначение нескольких групп
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, groups: user.groups ? [...new Set([...user.groups, ...groupMembers])] : [...groupMembers] } : user
        )
      );
      setUid('');
      setGroupId('');
      setGroupMembers([]);
      toast.success('Группы успешно назначены пользователю.');
    } catch (error) {
      console.error('Ошибка при назначении групп:', error);
      toast.error('Ошибка при назначении групп');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      toast.error('Введите название группы.');
      return;
    }

    if (groupMembers.length === 0) {
      toast.error('Выберите хотя бы одного участника.');
      return;
    }

    try {
      // Логирование перед отправкой запроса
      console.log('Отправляем данные для создания группы:', { name: newGroupName, members: groupMembers });

      const response = await createGroup(token, newGroupName, groupMembers);
      console.log('Ответ сервера при создании группы:', response);

      // Проверяем, что response содержит все необходимые поля
      if (response && response.id && response.name && Array.isArray(response.members)) {
        setGroups((prevGroups) => [...prevGroups, response]);
        setNewGroupName('');
        setGroupMembers([]);
        toast.success('Группа успешно создана');
      } else {
        throw new Error('Некорректный ответ от сервера');
      }
    } catch (error) {
      console.error('Ошибка при создании группы:', error);
      toast.error('Ошибка при создании группы');
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await deleteGroup(token, id); // Исправлено: вызываем функцию deleteGroup
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id));
      toast.success('Группа успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении группы:', error);
      toast.error('Ошибка при удалении группы');
    }
  };

  const handleDeleteUser = async () => {
    if (!uid) {
      toast.error('Выберите пользователя для удаления.');
      return;
    }

    try {
      await deleteUser(token, uid);
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));
      setUid('');
      toast.success('Пользователь успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      toast.error('Ошибка при удалении пользователя');
    }
  };

  const handleBlockUser = async () => {
    if (!uid) {
      toast.error('Выберите пользователя для блокировки.');
      return;
    }

    try {
      await blockUser(token, uid);
      setUsers((prevUsers) => prevUsers.map((user) => (user.uid === uid ? { ...user, isBlocked: true } : user)));
      setUid('');
      toast.success('Пользователь успешно заблокирован');
    } catch (error) {
      console.error('Ошибка при блокировке пользователя:', error);
      toast.error('Ошибка при блокировке пользователя');
    }
  };

  const handleUnblockUser = async () => {
    if (!uid) {
      toast.error('Выберите пользователя для разблокировки.');
      return;
    }

    try {
      await unblockUser(token, uid);
      setUsers((prevUsers) => prevUsers.map((user) => (user.uid === uid ? { ...user, isBlocked: false } : user)));
      setUid('');
      toast.success('Пользователь успешно разблокирован');
    } catch (error) {
      console.error('Ошибка при разблокировке пользователя:', error);
      toast.error('Ошибка при разблокировке пользователя');
    }
  };

  // Новая функция для удаления пользователя из группы
  const handleRemoveUserFromGroup = async (groupId, userId) => {
    try {
      await removeUserFromGroup(token, groupId, userId);
      setGroups((prevGroups) =>
        prevGroups.map((group) => (group.id === groupId ? { ...group, members: group.members.filter((id) => id !== userId) } : group))
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === userId ? { ...user, groups: user.groups ? user.groups.filter((id) => id !== groupId) : [] } : user
        )
      );
      toast.success('Пользователь успешно удален из группы');
    } catch (error) {
      console.error('Ошибка при удалении пользователя из группы:', error);
      toast.error('Ошибка при удалении пользователя из группы');
    }
  };

  return {
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
  };
};

export default useAdminPanel;
