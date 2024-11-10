// src/hooks/useAdminPanel.js
import { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
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
} from '../api/adminApi';

const useAdminPanel = () => {
  const { token } = useAuth(); // Получение токена из контекста
  const [uid, setUid] = useState('');
  const [role, setRole] = useState('');
  const [groupId, setGroupId] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Загрузка пользователей и групп
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [fetchedUsers, fetchedGroups] = await Promise.all([
          getUsers(token),
          getGroups(token),
        ]);
        setUsers(fetchedUsers);
        setGroups(fetchedGroups);
      } catch (error) {
        // Ошибки уже обрабатываются в API Helper
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Функция назначения роли
  const handleAssignRole = async () => {
    if (!uid || !role) {
      return;
    }

    try {
      await assignRole(token, uid, role);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, role } : user
        )
      );
      // Сброс выбора
      setUid('');
      setRole('');
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
    }
  };

  // Функция назначения группы
  const handleAssignGroup = async () => {
    if (!uid || !groupId) {
      return;
    }

    try {
      await assignGroup(token, uid, groupId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, group: groupId } : user
        )
      );
      // Сброс выбора
      setUid('');
      setGroupId('');
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
    }
  };

  // Функция создания группы
  const handleCreateGroup = async () => {
    if (!newGroupName) {
      return;
    }

    try {
      const newGroup = await createGroup(token, newGroupName);
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      setNewGroupName('');
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
    }
  };

  // Функция удаления группы
  const handleDeleteGroup = async (id) => {
    try {
      await deleteGroup(token, id);
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id));
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
    }
  };

  // Функция удаления пользователя
  const handleDeleteUser = async () => {
    if (!uid) return;

    try {
      await deleteUser(token, uid);
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));
      setUid('');
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
    }
  };

  // Функция блокировки пользователя
  const handleBlockUser = async () => {
    if (!uid) return;

    try {
      await blockUser(token, uid);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, isBlocked: true } : user
        )
      );
      setUid('');
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
    }
  };

  // Функция разблокировки пользователя
  const handleUnblockUser = async () => {
    if (!uid) return;

    try {
      await unblockUser(token, uid);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, isBlocked: false } : user
        )
      );
      setUid('');
    } catch (error) {
      // Ошибки уже обрабатываются в API Helper
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
    isLoading,
    uploading,
    handleAssignRole,
    handleAssignGroup,
    handleCreateGroup,
    handleDeleteGroup,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser,
  };
};

export default useAdminPanel;
