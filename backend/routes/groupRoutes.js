// server/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); 
const { firestore } = require('../firebase'); 

// Middleware для аутентификации
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // Логирование для отладки

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  console.log('ID Token:', idToken); // Логирование для отладки

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Decoded Token:', decodedToken); // Логирование для отладки
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    res.status(403).json({ error: 'Доступ запрещен' });
  }
};

// Создание новой группы
router.post('/create-group', authMiddleware, async (req, res) => {
  const { name, members } = req.body;
  const ownerId = req.user.uid;

  if (!name || !Array.isArray(members)) {
    return res.status(400).json({ error: 'Некорректные данные' });
  }

  try {
    const newGroupRef = await firestore.collection('groups').add({
      name,
      ownerId,
      members,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Обновление документов пользователей, чтобы добавить группы
    const batch = firestore.batch();
    members.forEach((uid) => {
      const userRef = firestore.collection('users').doc(uid);
      batch.update(userRef, {
        groups: admin.firestore.FieldValue.arrayUnion(newGroupRef.id),
      });
    });
    await batch.commit();

    const newGroup = {
      id: newGroupRef.id,
      name,
      ownerId,
      members,
      createdAt: new Date(),
    };

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Ошибка при создании группы:', error);
    res.status(500).json({ error: 'Ошибка при создании группы' });
  }
});

module.exports = router;
