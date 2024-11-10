// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import MainCard from 'components/MainCard';
import ProfileForm from 'components/ProfileForm';
import LoadingOverlay from 'components/LoadingOverlay';
import useUserProfile from 'hooks/useUserProfile';
import uploadProfilePicture from 'utils/uploadProfilePicture';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserProfile() {
  const {
    userName,
    userEmail,
    userStatus,
    userRole,
    userPosition,
    profilePic,
    userBio,
    userPhone,
    isBlocked,
    userGroupId,
    userGroupName,
    isLoading,
  } = useUserProfile();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    userphone: '',
    position: '',
    userbio: '',
    profile_pic: '',
  });
  const [uploading, setUploading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Инициализация formData при изменении данных пользователя или при выходе из режима редактирования
  useEffect(() => {
    if (!editing) {
      setFormData({
        username: userName,
        email: userEmail,
        userphone: userPhone,
        position: userPosition,
        userbio: userBio,
        profile_pic: profilePic,
      });
    }
  }, [userName, userEmail, userPhone, userPosition, userBio, profilePic, editing]);

  // Обработка редактирования
  const handleEdit = () => {
    setEditing(true);
  };

  // Обработка отмены редактирования
  const handleCancel = () => {
    setEditing(false);
    // Сброс формы к данным из хука
    setFormData({
      username: userName,
      email: userEmail,
      userphone: userPhone,
      position: userPosition,
      userbio: userBio,
      profile_pic: profilePic,
    });
  };

  // Обработка изменений в форме
  const handleInputChange = (e) => {
    if (!editing) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработка загрузки нового изображения профиля
  const handleFileChange = async (event) => {
    if (!editing) return;
    const file = event.target.files[0];
    if (file && currentUser) {
      setUploading(true);
      try {
        const url = await uploadProfilePicture(currentUser.uid, file);
        setFormData((prev) => ({
          ...prev,
          profile_pic: url,
        }));
        toast.success('Изображение успешно загружено!');
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
        toast.error('Не удалось загрузить изображение.');
      } finally {
        setUploading(false);
      }
    }
  };

  // Обработка сохранения изменений
  const handleSave = async () => {
    if (!currentUser) return;

    // Валидация
    if (!formData.username.trim()) {
      toast.error('Пожалуйста, введите имя пользователя.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Пожалуйста, введите email.');
      return;
    }
    // Дополнительные проверки можно добавить здесь

    try {
      // Обновление Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        username: formData.username,
        email: formData.email,
        userphone: formData.userphone,
        position: formData.position,
        userbio: formData.userbio,
        profile_pic: formData.profile_pic,
      };

      // Если у пользователя есть группа, сохранить группу
      if (userGroupId) {
        updateData.group = userGroupId;
      }

      await updateDoc(userDocRef, updateData);

      // Обновление Firebase Authentication
      await updateProfile(currentUser, {
        displayName: formData.username,
        photoURL: formData.profile_pic,
      });

      setEditing(false);
      toast.success('Данные успешно обновлены!');
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      toast.error('Произошла ошибка при обновлении данных.');
    }
  };

  // Обработчик открытия диалога подтверждения сохранения
  const handleSaveClick = () => {
    setConfirmDialogOpen(true);
  };

  // Обработчик подтверждения сохранения
  const handleConfirmSave = () => {
    setConfirmDialogOpen(false);
    handleSave();
  };

  // Подготовка массива групп для передачи в ProfileForm
  const userGroups = userGroupName ? [{ id: userGroupId, name: userGroupName }] : [];

  return (
    <>
      <MainCard sx={{ mt: 4, p: 3 }}>
        {/* Индикатор загрузки */}
        {isLoading && <LoadingOverlay />}

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'left' }}>
          Личная информация
        </Typography>

        <ProfileForm
          formData={formData}
          userGroups={userGroups} // Передаём массив групп
          editing={editing}
          uploading={uploading}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleSaveClick={handleSaveClick}
          handleCancel={handleCancel}
          handleEdit={handleEdit}
        />
      </MainCard>

      {/* Диалог подтверждения сохранения */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы уверены, что хотите сохранить изменения?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmSave} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Контейнер для уведомлений */}
      <ToastContainer />
    </>
  );
}
