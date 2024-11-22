// src/hooks/useAdminPanel.js

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'react-toastify';

const useAdminPanel = () => {
  const { customClaims, isLoading: authIsLoading } = useAuth();
  const [uid, setUid] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Функция для получения пользователей из Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      setUsers(usersList);
      console.log('Пользователи загружены:', usersList);
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      toast.error('Не удалось загрузить список пользователей');
    }
  };

  // Функция для получения групп из Firestore
  const fetchGroups = async () => {
    try {
      const groupsCollection = collection(db, 'groups');
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsList = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsList);
      console.log('Группы загружены:', groupsList);
    } catch (error) {
      console.error('Ошибка при получении групп:', error);
      toast.error('Не удалось загрузить список групп');
    }
  };

  // Загрузка данных при монтировании хука
  useEffect(() => {
    const fetchData = async () => {
      if (authIsLoading || !customClaims) {
        setIsLoading(true);
        return;
      }

      // Проверка, что пользователь является администратором
      if (!customClaims.admin) {
        setIsLoading(false);
        return;
      }

      try {
        await Promise.all([fetchUsers(), fetchGroups()]);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customClaims, authIsLoading]);

  // Назначение групп пользователю
  const handleAssignGroups = async () => {
    if (!uid || groupMembers.length === 0) {
      toast.error('Выберите пользователя и группы для назначения');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        groups: arrayUnion(...groupMembers)
      });

      // Обновление поля members в каждой назначенной группе
      await Promise.all(
        groupMembers.map(async (groupId) => {
          const groupDocRef = doc(db, 'groups', groupId);
          await updateDoc(groupDocRef, {
            members: arrayUnion(uid)
          });
        })
      );

      toast.success('Группы успешно назначены пользователю');
      // Обновление списка пользователей и групп
      await fetchUsers();
      await fetchGroups();
      // Сброс выбранных групп и пользователя
      setUid('');
      setGroupMembers([]);
    } catch (error) {
      console.error('Ошибка при назначении групп:', error);
      toast.error('Не удалось назначить группы пользователю');
    }
  };

  // Создание новой группы
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Введите название группы');
      return;
    }
    if (groupMembers.length === 0) {
      toast.error('Выберите хотя бы одного участника');
      return;
    }

    try {
      const newGroup = {
        name: newGroupName,
        members: groupMembers
      };
      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      toast.success('Группа успешно создана');
      console.log('Группа создана с ID:', docRef.id);
      // Обновление списка групп
      await fetchGroups();
      // Обновление поля groups у каждого участника группы
      await Promise.all(
        groupMembers.map(async (userId) => {
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            groups: arrayUnion(docRef.id)
          });
        })
      );
      // Обновление списка пользователей после добавления групп
      await fetchUsers();
      // Сброс названия группы и выбранных участников
      setNewGroupName('');
      setGroupMembers([]);
    } catch (error) {
      console.error('Ошибка при создании группы:', error);
      toast.error('Не удалось создать группу');
    }
  };

  // Удаление группы
  const handleDeleteGroup = async (id) => {
    if (!id) return;

    try {
      await deleteDoc(doc(db, 'groups', id));
      toast.success('Группа успешно удалена');
      // Обновление списка групп
      await fetchGroups();
      // Удаление группы из списка групп всех пользователей
      const usersToUpdate = users.filter((user) => user.groups && user.groups.includes(id));
      await Promise.all(
        usersToUpdate.map(async (user) => {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            groups: arrayRemove(id)
          });
        })
      );
      await fetchUsers();
    } catch (error) {
      console.error('Ошибка при удалении группы:', error);
      toast.error('Не удалось удалить группу');
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async () => {
    if (!uid) {
      toast.error('Выберите пользователя для удаления');
      return;
    }

    try {
      // Удаление пользователя из всех групп
      const user = users.find((user) => user.uid === uid);
      if (user && user.groups && user.groups.length > 0) {
        await Promise.all(
          user.groups.map(async (groupId) => {
            const groupDocRef = doc(db, 'groups', groupId);
            await updateDoc(groupDocRef, {
              members: arrayRemove(uid)
            });
          })
        );
      }

      // Удаление пользователя из коллекции 'users'
      await deleteDoc(doc(db, 'users', uid));
      toast.success('Пользователь успешно удален');
      // Обновление списка пользователей
      await fetchUsers();
      setUid('');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      toast.error('Не удалось удалить пользователя');
    }
  };

  // Блокировка пользователя
  const handleBlockUser = async () => {
    if (!uid) {
      toast.error('Выберите пользователя для блокировки');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { blocked: true });
      toast.success('Пользователь успешно заблокирован');
      // Обновление списка пользователей
      await fetchUsers();
      setUid('');
    } catch (error) {
      console.error('Ошибка при блокировке пользователя:', error);
      toast.error('Не удалось заблокировать пользователя');
    }
  };

  // Разблокировка пользователя
  const handleUnblockUser = async () => {
    if (!uid) {
      toast.error('Выберите пользователя для разблокировки');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { blocked: false });
      toast.success('Пользователь успешно разблокирован');
      // Обновление списка пользователей
      await fetchUsers();
      setUid('');
    } catch (error) {
      console.error('Ошибка при разблокировке пользователя:', error);
      toast.error('Не удалось разблокировать пользователя');
    }
  };

  // Удаление пользователя из группы
  const handleRemoveUserFromGroup = async (groupId, userId) => {
    try {
      const groupDocRef = doc(db, 'groups', groupId);
      await updateDoc(groupDocRef, {
        members: arrayRemove(userId)
      });

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        groups: arrayRemove(groupId)
      });

      toast.success('Пользователь успешно удален из группы');
      // Обновление списков пользователей и групп
      await fetchUsers();
      await fetchGroups();
    } catch (error) {
      console.error('Ошибка при удалении пользователя из группы:', error);
      toast.error('Не удалось удалить пользователя из группы');
    }
  };

  return {
    uid,
    setUid,
    users,
    groups,
    newGroupName,
    setNewGroupName,
    groupMembers,
    setGroupMembers,
    selectedGroupId,
    setSelectedGroupId,
    isLoading,
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
