// components/ProfileForm.jsx
import React from 'react';
import { TextField, Button, Stack, Avatar, Grid, Chip, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { UploadOutlined } from '@ant-design/icons';

const ProfileForm = ({
  formData,
  userGroups = [], // По умолчанию пустой массив
  editing,
  uploading,
  handleInputChange,
  handleFileChange,
  handleSaveClick,
  handleCancel,
  handleEdit,
  handleResetPassword // Новый пропс для восстановления пароля
}) => {
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);

  const openResetDialog = () => setResetDialogOpen(true);
  const closeResetDialog = () => setResetDialogOpen(false);

  return (
    <Grid container spacing={6} justifyContent="start" alignItems="center">
      {/* Левая колонка: Аватар и загрузка фото */}
      <Grid item xs={12} md={5} container justifyContent="center">
        <Stack spacing={3} alignItems="center">
          <Avatar src={formData.profile_pic} sx={{ width: 240, height: 240 }} alt={formData.username} />
          {editing && (
            <Button variant="contained" component="label" startIcon={<UploadOutlined />} disabled={uploading}>
              {uploading ? 'Загрузка...' : 'Загрузить фото'}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Правая колонка: Форма профиля */}
      <Grid item xs={12} md={6}>
        <Stack spacing={4}>
          <TextField
            label="Имя пользователя"
            name="username"
            value={formData.username || ''}
            onChange={handleInputChange}
            fullWidth
            InputProps={{
              readOnly: !editing
            }}
          />

          <TextField
            label="Email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            fullWidth
            InputProps={{
              readOnly: !editing
            }}
          />

          <TextField
            label="Номер телефона"
            name="userphone"
            value={formData.userphone || ''}
            onChange={handleInputChange}
            fullWidth
            InputProps={{
              readOnly: !editing
            }}
          />

          <TextField
            label="Должность"
            name="position"
            value={formData.position || ''}
            onChange={handleInputChange}
            fullWidth
            InputProps={{
              readOnly: !editing
            }}
          />

          <TextField
            label="О себе"
            name="userbio"
            value={formData.userbio || ''}
            onChange={handleInputChange}
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            InputProps={{
              readOnly: !editing
            }}
          />

          {/* Отображение групп пользователя */}
          <Stack spacing={1}>
            <Typography variant="h6">Группы:</Typography>
            {userGroups.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {userGroups.map((group) => (
                  <Chip key={group.id} label={group.name} color="primary" variant="outlined" style={{ marginBottom: '8px' }} />
                ))}
              </Stack>
            ) : (
              <Typography>Вы не состоите в группах.</Typography>
            )}
          </Stack>

          {/* Кнопки редактирования, сохранения и восстановления пароля */}
          <Stack direction="row" spacing={2}>
            {editing ? (
              <>
                <Button variant="contained" color="primary" onClick={handleSaveClick} disabled={uploading}>
                  Сохранить
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancel}>
                  Отмена
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" color="primary" onClick={handleEdit}>
                  Редактировать
                </Button>
                <Button variant="outlined" color="secondary" onClick={openResetDialog}>
                  Восстановить пароль
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Grid>

      {/* Диалог восстановления пароля */}
      <Dialog open={resetDialogOpen} onClose={closeResetDialog}>
        <DialogTitle>Восстановление пароля</DialogTitle>
        <DialogContent>
          <DialogContentText>
            На ваш email будет отправлена ссылка для восстановления пароля. Продолжить?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResetDialog} color="secondary">
            Отмена
          </Button>
          <Button onClick={handleResetPassword} color="primary">
            Отправить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ProfileForm;
