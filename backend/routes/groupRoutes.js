// server/routes/groupRoutes.js или ваш основной серверный файл
const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Предполагается, что Firebase уже инициализирован
const db = admin.firestore();

// Middleware для проверки администраторских прав
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      req.user = decodedToken;
      return next();
    } else {
      return res
        .status(403)
        .json({ error: "Доступ запрещен: требуется роль администратора" });
    }
  } catch (error) {
    console.error("Ошибка при проверке токена:", error);
    return res.status(403).json({ error: "Доступ запрещен" });
  }
};

// Эндпоинт для удаления пользователя из группы
router.post("/remove-user-from-group", verifyAdmin, async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ error: "groupId и userId обязательны" });
  }

  try {
    // Удаляем пользователя из массива members в группе
    const groupRef = db.collection("groups").doc(groupId);
    await groupRef.update({
      members: admin.firestore.FieldValue.arrayRemove(userId),
    });

    // Обновляем поле groupId у пользователя
    const userRef = db.collection("users").doc(userId);
    await userRef.update({ groupId: null });

    res.json({ message: "Пользователь успешно удален из группы" });
  } catch (error) {
    console.error("Ошибка при удалении пользователя из группы:", error);
    res
      .status(500)
      .json({ error: "Не удалось удалить пользователя из группы" });
  }
});

router.post("/delete-group", verifyAdmin, async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: "groupId обязателен" });
  }

  try {
    const groupRef = admin.firestore().collection("groups").doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Группа не найдена" });
    }

    const groupData = groupDoc.data();

    // Удаляем группу из Firestore
    await groupRef.delete();

    // Обновляем поле groupId у всех участников группы
    const batch = admin.firestore().batch();
    groupData.members.forEach((uid) => {
      const userRef = admin.firestore().collection("users").doc(uid);
      batch.update(userRef, { groupId: admin.firestore.FieldValue.delete() });
    });

    await batch.commit();

    res.json({ message: "Группа успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении группы:", error);
    res.status(500).json({ error: "Не удалось удалить группу" });
  }
});

module.exports = router;
