const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(express.json());

// Middleware для проверки прав администратора
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin === true) { // Проверка кастомного утверждения admin
      req.user = decodedToken;
      return next();
    } else {
      return res.status(403).json({ error: 'Доступ запрещен: требуется роль администратора' });
    }
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
};

// Эндпоинт для присвоения роли пользователю
app.post('/assign-role', verifyAdmin, async (req, res) => {
  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: 'UID и роль обязательны' });
  }

  try {
    let customClaims = {};
    if (role === 'admin') {
      customClaims.admin = true;
    } else {
      customClaims.admin = false;
    }

    // Назначаем роль через custom claims
    await admin.auth().setCustomUserClaims(uid, customClaims);

    // Обновляем данные о роли в Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ role });

    res.json({ message: 'Роль успешно назначена!' });
  } catch (error) {
    console.error('Ошибка при назначении роли:', error);
    res.status(500).json({ error: 'Не удалось назначить роль' });
  }
});

// Эндпоинт для назначения группы пользователю
app.post('/assign-group', verifyAdmin, async (req, res) => {
  const { uid, groupId } = req.body;

  if (!uid || !groupId) {
    return res.status(400).json({ error: 'UID пользователя и идентификатор группы обязательны' });
  }

  try {
    // Проверяем, существует ли группа
    const groupDoc = await db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Обновляем группу пользователя в Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ group: groupId });

    res.json({ message: 'Группа успешно назначена пользователю!' });
  } catch (error) {
    console.error('Ошибка при назначении группы:', error);
    res.status(500).json({ error: 'Не удалось назначить группу' });
  }
});

// Эндпоинт для создания группы
app.post('/create-group', verifyAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Название группы обязательно' });
  }

  try {
    const groupRef = await db.collection('groups').add({ name });
    res.json({ id: groupRef.id, name });
  } catch (error) {
    console.error('Ошибка при создании группы:', error);
    res.status(500).json({ error: 'Не удалось создать группу' });
  }
});

// Эндпоинт для удаления группы
app.post('/delete-group', verifyAdmin, async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: 'Идентификатор группы обязателен' });
  }

  try {
    // Проверяем, есть ли пользователи в этой группе
    const usersSnapshot = await db.collection('users').where('group', '==', groupId).get();
    if (!usersSnapshot.empty) {
      return res.status(400).json({ error: 'Невозможно удалить группу, в ней есть пользователи' });
    }

    await db.collection('groups').doc(groupId).delete();
    res.json({ message: 'Группа успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    res.status(500).json({ error: 'Не удалось удалить группу' });
  }
});

// Эндпоинт для получения списка групп
app.get('/get-groups', verifyAdmin, async (req, res) => {
  try {
    const groupsSnapshot = await db.collection('groups').get();
    const groups = [];
    groupsSnapshot.forEach(doc => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    res.json({ groups });
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    res.status(500).json({ error: 'Не удалось получить группы' });
  }
});

// Эндпоинт для получения списка пользователей
app.get('/get-users', verifyAdmin, async (req, res) => {
    console.log('Получен запрос на /get-users от пользователя:', req.user.uid);
    try {
      const usersSnapshot = await db.collection('users').get();
      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      console.log('Получено пользователей:', users.length);
      res.json({ users });
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      res.status(500).json({ error: 'Не удалось получить пользователей' });
    }
  });
  

// Эндпоинт для блокировки пользователя
app.post('/block-user', verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID пользователя обязателен' });
  }

  try {
    // Добавляем custom claim для блокировки пользователя
    await admin.auth().setCustomUserClaims(uid, { blocked: true });

    // Обновляем статус в Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ isBlocked: true });

    res.json({ message: 'Пользователь успешно заблокирован' });
  } catch (error) {
    console.error('Ошибка при блокировке пользователя:', error);
    res.status(500).json({ error: 'Не удалось заблокировать пользователя' });
  }
});

// Эндпоинт для разблокировки пользователя
app.post('/unblock-user', verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID пользователя обязателен' });
  }

  try {
    // Удаляем custom claim для разблокировки пользователя
    await admin.auth().setCustomUserClaims(uid, { blocked: false });

    // Обновляем статус в Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ isBlocked: false });

    res.json({ message: 'Пользователь успешно разблокирован' });
  } catch (error) {
    console.error('Ошибка при разблокировке пользователя:', error);
    res.status(500).json({ error: 'Не удалось разблокировать пользователя' });
  }
});

// Эндпоинт для удаления пользователя
app.post('/delete-user', verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID пользователя обязателен' });
  }

  try {
    // Удаляем пользователя из Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Удаляем документ пользователя из Firestore
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.delete();

    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Не удалось удалить пользователя' });
  }
});

// Эндпоинт для назначения роли администратора
app.post('/set-admin-role', verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID пользователя обязателен' });
  }

  try {
    // Назначаем роль администратора
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Обновляем роль в Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ role: 'admin' });

    res.json({ message: 'Пользователь теперь является администратором' });
  } catch (error) {
    console.error('Ошибка при назначении роли администратора:', error);
    res.status(500).json({ error: 'Не удалось назначить роль администратора' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
