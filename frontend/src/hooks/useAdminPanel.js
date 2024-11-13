// src/hooks/useAdminPanel.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUsers,
  getGroups,
  assignRole,
  assignGroup,
  createGroup,
  deleteGroup,
  deleteUser,
  blockUser,
  unblockUser,
  removeUserFromGroup, // Импортируем новую функцию из API
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
        const [fetchedUsers, fetchedGroups] = await Promise.all([
          getUsers(token),
          getGroups(token),
        ]);
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

  const handleToggleMember = (userId) => {
    setGroupMembers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleAssignRole = async () => {
    if (!uid || !role) {
      toast.error('Выберите пользователя и роль.');
      return;
    }

    try {
      await assignRole(token, uid, role);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.uid === uid ? { ...user, role } : user))
      );
      setUid('');
      setRole('');
      toast.success('Роль успешно назначена');
    } catch (error) {
      console.error('Ошибка при назначении роли:', error);
      toast.error('Ошибка при назначении роли');
    }
  };

  const handleAssignGroup = async () => {
    if (!uid || !groupId) {
      toast.error('Выберите пользователя и группу.');
      return;
    }

    try {
      await assignGroup(token, uid, groupId);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.uid === uid ? { ...user, group: groupId } : user))
      );
      setUid('');
      setGroupId('');
      toast.success('Группа успешно назначена');
    } catch (error) {
      console.error('Ошибка при назначении группы:', error);
      toast.error('Ошибка при назначении группы');
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
      const newGroup = await createGroup(token, newGroupName, groupMembers);
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      setNewGroupName('');
      setGroupMembers([]);
      toast.success('Группа успешно создана!');
    } catch (error) {
      console.error('Ошибка при создании группы:', error);
      toast.error('Ошибка при создании группы');
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await deleteGroup(token, id);
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
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, isBlocked: true } : user
        )
      );
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
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, isBlocked: false } : user
        )
      );
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
        prevGroups.map((group) =>
          group.id === groupId
            ? { ...group, members: group.members.filter((id) => id !== userId) }
            : group
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
    handleToggleMember,
    isLoading,
    handleAssignRole,
    handleAssignGroup,
    handleCreateGroup,
    handleDeleteGroup,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser,
    handleRemoveUserFromGroup, // Добавляем функцию в возвращаемый объект
  };
};

export default useAdminPanel;
