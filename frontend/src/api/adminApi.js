// src/api/adminApi.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Функция для обработки ошибок
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    toast.error(error.response.data.error || 'Произошла ошибка при взаимодействии с сервером.');
  } else if (error.request) {
    toast.error('Сервер не отвечает. Попробуйте позже.');
  } else {
    toast.error('Произошла ошибка. Попробуйте ещё раз.');
  }
};

// Получение списка пользователей
export const getUsers = async (token) => {
  try {
    const response = await apiClient.get('/get-users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.users;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Получение списка групп
export const getGroups = async (token) => {
  try {
    const response = await apiClient.get('/get-groups', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.groups;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Назначение роли пользователю
export const assignRole = async (token, uid, role) => {
  try {
    const response = await apiClient.post(
      '/assign-role',
      { uid, role },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success(response.data.message || 'Роль успешно назначена!');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Назначение группы пользователю
export const assignGroup = async (token, uid, groupId) => {
  try {
    const response = await apiClient.post(
      '/assign-group',
      { uid, groupId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success(response.data.message || 'Группа успешно назначена пользователю!');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Создание новой группы
export const createGroup = async (token, groupName, members) => {
  try {
    console.log('Создание группы с данными:', { name: groupName, members });
    const response = await apiClient.post(
      '/create-group',
      { name: groupName, members: members },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('Ответ сервера:', response.data);
    toast.success('Группа успешно создана!4');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Удаление группы
export const deleteGroup = async (token, groupId) => {
  try {
    const response = await apiClient.post(
      '/delete-group',
      { groupId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success(response.data.message || 'Группа успешно удалена!');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Функция для удаления пользователя из группы
export const removeUserFromGroup = async (token, groupId, userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/remove-user-from-group`,
      { groupId, userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Ответ сервера при удалении пользователя из группы:', response.data);
    toast.success('Пользователь успешно удален из группы');
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении пользователя из группы:', error);
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(`Ошибка: ${error.response.data.error}`);
    } else {
      toast.error('Ошибка при удалении пользователя из группы');
    }
    throw error;
  }
};

// Удаление пользователя
export const deleteUser = async (token, uid) => {
  try {
    const response = await apiClient.post(
      '/delete-user',
      { uid },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success(response.data.message || 'Пользователь успешно удален!');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Блокировка пользователя
export const blockUser = async (token, uid) => {
  try {
    const response = await apiClient.post(
      '/block-user',
      { uid },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success(response.data.message || 'Пользователь успешно заблокирован!');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Разблокировка пользователя
export const unblockUser = async (token, uid) => {
  try {
    const response = await apiClient.post(
      '/unblock-user',
      { uid },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success(response.data.message || 'Пользователь успешно разблокирован!');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
