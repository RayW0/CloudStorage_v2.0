// src/api/adminApi.js

import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Назначает одну или несколько групп пользователю.
 * @param {string} token - Токен аутентификации.
 * @param {string} userId - Идентификатор пользователя.
 * @param {string[]} groupIds - Массив идентификаторов групп.
 */
export const assignGroup = async (token, userId, groupIds) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      groups: arrayUnion(...groupIds)
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Удаляет группу из пользователя.
 * @param {string} token - Токен аутентификации.
 * @param {string} userId - Идентификатор пользователя.
 * @param {string} groupId - Идентификатор группы.
 */
export const removeGroupFromUser = async (token, userId, groupId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      groups: arrayRemove(groupId)
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Удаляет пользователя из группы.
 * @param {string} token - Токен аутентификации.
 * @param {string} groupId - Идентификатор группы.
 * @param {string} userId - Идентификатор пользователя.
 */
export const removeUserFromGroup = async (token, groupId, userId) => {
  try {
    // Удаляем пользователя из группы
    const groupDocRef = doc(db, 'groups', groupId);
    await updateDoc(groupDocRef, {
      members: arrayRemove(userId)
    });

    // Удаляем группу из пользователя
    await removeGroupFromUser(token, userId, groupId);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Создаёт новую группу с указанными участниками.
 * @param {string} token - Токен аутентификации.
 * @param {string} groupName - Название группы.
 * @param {string[]} members - Массив UID участников.
 */
export const createGroup = async (token, groupName, members) => {
  try {
    const groupDocRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      members: members,
      createdAt: new Date().toISOString()
    });

    return { id: groupDocRef.id, name: groupName, members };
  } catch (error) {
    throw error;
  }
};

/**
 * Получает всех пользователей.
 * @param {string} token - Токен аутентификации.
 */
export const getUsers = async (token) => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Получает все группы.
 * @param {string} token - Токен аутентификации.
 */
export const getGroups = async (token) => {
  try {
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    const groups = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return groups;
  } catch (error) {
    throw error;
  }
};

/**
 * Удаляет группу.
 * @param {string} token - Токен аутентификации.
 * @param {string} groupId - Идентификатор группы.
 */
export const deleteGroup = async (token, groupId) => {
  try {
    const groupDocRef = doc(db, 'groups', groupId);
    await deleteDoc(groupDocRef);

    // Также удаляем группу из всех пользователей, которые в неё входят
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const updatePromises = usersSnapshot.docs.map((userDoc) => {
      const userData = userDoc.data();
      if (userData.groups && userData.groups.includes(groupId)) {
        return updateDoc(userDoc.ref, {
          groups: arrayRemove(groupId)
        });
      }
      return null;
    });

    await Promise.all(updatePromises.filter((p) => p !== null));

    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Удаляет пользователя.
 * @param {string} token - Токен аутентификации.
 * @param {string} userId - Идентификатор пользователя.
 */
export const deleteUser = async (token, userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);

    // Также удаляем пользователя из всех групп, в которых он состоит
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    const updatePromises = groupsSnapshot.docs.map((groupDoc) => {
      const groupData = groupDoc.data();
      if (groupData.members && groupData.members.includes(userId)) {
        return updateDoc(groupDoc.ref, {
          members: arrayRemove(userId)
        });
      }
      return null;
    });

    await Promise.all(updatePromises.filter((p) => p !== null));

    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Блокирует пользователя.
 * @param {string} token - Токен аутентификации.
 * @param {string} userId - Идентификатор пользователя.
 */
export const blockUser = async (token, userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      isBlocked: true
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Разблокирует пользователя.
 * @param {string} token - Токен аутентификации.
 * @param {string} userId - Идентификатор пользователя.
 */
export const unblockUser = async (token, userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      isBlocked: false
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};
