const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

// Middleware для проверки прав администратора
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      // Проверка кастомного утверждения admin
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

// Эндпоинт для присвоения роли пользователю
app.post("/assign-role", verifyAdmin, async (req, res) => {
  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: "UID и роль обязательны" });
  }

  try {
    let customClaims = {};
    if (role === "admin") {
      customClaims.admin = true;
    } else {
      customClaims.admin = false;
    }

    // Назначаем роль через custom claims
    await admin.auth().setCustomUserClaims(uid, customClaims);

    // Обновляем данные о роли в Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ role });

    res.json({ message: "Роль успешно назначена!" });
  } catch (error) {
    console.error("Ошибка при назначении роли:", error);
    res.status(500).json({ error: "Не удалось назначить роль" });
  }
});

// Эндпоинт для назначения группы пользователю
app.post("/assign-group", verifyAdmin, async (req, res) => {
  const { uid, groupId } = req.body;

  if (!uid || !groupId) {
    return res
      .status(400)
      .json({ error: "UID пользователя и идентификатор группы обязательны" });
  }

  try {
    // Проверяем, существует ли группа
    const groupDoc = await db.collection("groups").doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Группа не найдена" });
    }

    // Обновляем группу пользователя в Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ group: groupId });
    console.log(`Поле groupId пользователя ${uid} обновлено на ${groupId}`);

    // Добавляем пользователя в массив members группы, если его там ещё нет
    const groupRef = db.collection("groups").doc(groupId);
    await groupRef.update({
      members: admin.firestore.FieldValue.arrayUnion(uid),
    });
    console.log(`Пользователь ${uid} добавлен в группу ${groupId}`);

    res.json({ message: "Группа успешно назначена пользователю!" });
  } catch (error) {
    console.error("Ошибка при назначении группы:", error);
    res.status(500).json({ error: "Не удалось назначить группу" });
  }
});

// Эндпоинт для создания группы
app.post("/create-group", verifyAdmin, async (req, res) => {
  const { name, members } = req.body; // Извлекаем name и members из тела запроса

  // Логирование полученных данных
  console.log("Полученные данные для создания группы:", { name, members });

  // Валидация входящих данных
  if (!name) {
    return res.status(400).json({ error: "Название группы обязательно" });
  }

  if (!Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: "Список участников обязателен" });
  }

  try {
    // Проверяем существование всех пользователей
    const nonExistentUids = await checkUsersExist(members);
    if (nonExistentUids.length > 0) {
      return res.status(400).json({
        error: `Пользователи с UID ${nonExistentUids.join(", ")} не найдены`,
      });
    }

    // Создаём группу с полями name и members
    const groupData = { name, members };
    const groupRef = await db.collection("groups").add(groupData);
    console.log("Группа создана с ID:", groupRef.id);

    // Обновляем поле groupId для каждого участника в отдельной операции
    const batch = db.batch();
    members.forEach((uid) => {
      const userRef = db.collection("users").doc(uid);
      batch.update(userRef, { groupId: groupRef.id });
    });

    await batch.commit();
    console.log("Поле groupId обновлено для участников группы:", members);

    // Отправляем ответ с полями id, name и members
    res.json({ id: groupRef.id, name, members });
    console.log("Отправляем ответ с группой:", {
      id: groupRef.id,
      name,
      members,
    });
  } catch (error) {
    console.error("Ошибка при создании группы:", error);
    res.status(500).json({ error: "Не удалось создать группу" });
  }
});

// Дополнительная функция для проверки существования пользователей
const checkUsersExist = async (members) => {
  const batchSize = 10; // Firestore 'in' запрос ограничен 10 элементами
  const nonExistentUids = [];

  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    const usersSnapshot = await db
      .collection("users")
      .where(admin.firestore.FieldPath.documentId(), "in", batch)
      .get();
    const existingUids = usersSnapshot.docs.map((doc) => doc.id);
    const missingUids = batch.filter((uid) => !existingUids.includes(uid));
    nonExistentUids.push(...missingUids);
  }

  return nonExistentUids;
};

// Эндпоинт для удаления пользователя из группы
app.post("/remove-user-from-group", verifyAdmin, async (req, res) => {
  const { groupId, userId } = req.body;

  // Валидация входящих данных
  if (!groupId || !userId) {
    return res.status(400).json({ error: "groupId и userId обязательны" });
  }

  try {
    // Получаем ссылку на документ группы
    const groupRef = db.collection("groups").doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Группа не найдена" });
    }

    const groupData = groupDoc.data();

    // Проверяем, является ли пользователь членом группы
    if (!groupData.members.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Пользователь не является членом этой группы" });
    }

    // Удаляем пользователя из массива members
    await groupRef.update({
      members: admin.firestore.FieldValue.arrayRemove(userId),
    });
    console.log(`Пользователь ${userId} удален из группы ${groupId}`);

    // Обновляем поле groupId у пользователя на 'none'
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      groupId: "none",
    });
    console.log(`Поле groupId пользователя ${userId} обновлено на 'none'`);

    res.json({ message: "Пользователь успешно удален из группы" });
  } catch (error) {
    console.error("Ошибка при удалении пользователя из группы:", error);
    res
      .status(500)
      .json({ error: "Не удалось удалить пользователя из группы" });
  }
});

// Эндпоинт для получения списка групп
app.get("/get-groups", verifyAdmin, async (req, res) => {
  try {
    const groupsSnapshot = await db.collection("groups").get();
    const groups = [];
    groupsSnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    res.json({ groups });
  } catch (error) {
    console.error("Ошибка при получении групп:", error);
    res.status(500).json({ error: "Не удалось получить группы" });
  }
});

// Эндпоинт для получения списка пользователей
app.get("/get-users", verifyAdmin, async (req, res) => {
  console.log("Получен запрос на /get-users от пользователя:", req.user.uid);
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });
    console.log("Получено пользователей:", users.length);
    res.json({ users });
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ error: "Не удалось получить пользователей" });
  }
});

// Эндпоинт для блокировки пользователя
app.post("/block-user", verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID пользователя обязателен" });
  }

  try {
    // Добавляем custom claim для блокировки пользователя
    await admin.auth().setCustomUserClaims(uid, { blocked: true });

    // Обновляем статус в Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ isBlocked: true });

    res.json({ message: "Пользователь успешно заблокирован" });
  } catch (error) {
    console.error("Ошибка при блокировке пользователя:", error);
    res.status(500).json({ error: "Не удалось заблокировать пользователя" });
  }
});

// Эндпоинт для разблокировки пользователя
app.post("/unblock-user", verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID пользователя обязателен" });
  }

  try {
    // Удаляем custom claim для разблокировки пользователя
    await admin.auth().setCustomUserClaims(uid, { blocked: false });

    // Обновляем статус в Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ isBlocked: false });

    res.json({ message: "Пользователь успешно разблокирован" });
  } catch (error) {
    console.error("Ошибка при разблокировке пользователя:", error);
    res.status(500).json({ error: "Не удалось разблокировать пользователя" });
  }
});

// Эндпоинт для удаления пользователя
app.post("/delete-user", verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID пользователя обязателен" });
  }

  try {
    // Удаляем пользователя из Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Удаляем документ пользователя из Firestore
    const userDocRef = db.collection("users").doc(uid);
    await userDocRef.delete();

    res.json({ message: "Пользователь успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).json({ error: "Не удалось удалить пользователя" });
  }
});

// Эндпоинт для удаления группы
app.post("/delete-group", verifyAdmin, async (req, res) => {
  const { groupId } = req.body;

  // Валидация входящих данных
  if (!groupId) {
    return res.status(400).json({ error: "groupId обязателен" });
  }

  try {
    // Получаем ссылку на документ группы
    const groupRef = db.collection("groups").doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Группа не найдена" });
    }

    const groupData = groupDoc.data();

    // Удаляем группу из Firestore
    await groupRef.delete();
    console.log(`Группа ${groupId} удалена из Firestore`);

    // Обновляем поле groupId у всех участников группы
    const batch = db.batch();
    groupData.members.forEach((uid) => {
      const userRef = db.collection("users").doc(uid);
      batch.update(userRef, { groupId: admin.firestore.FieldValue.delete() });
    });

    await batch.commit();
    console.log(`Поле groupId обновлено для участников группы ${groupId}`);

    res.json({ message: "Группа успешно удалена" });
    console.log(`Отправлен успешный ответ по удалению группы ${groupId}`);
  } catch (error) {
    console.error("Ошибка при удалении группы:", error);
    res.status(500).json({ error: "Не удалось удалить группу" });
  }
});

// Эндпоинт для назначения роли администратора
app.post("/set-admin-role", verifyAdmin, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID пользователя обязателен" });
  }

  try {
    // Назначаем роль администратора
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Обновляем роль в Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ role: "admin" });

    res.json({ message: "Пользователь теперь является администратором" });
  } catch (error) {
    console.error("Ошибка при назначении роли администратора:", error);
    res.status(500).json({ error: "Не удалось назначить роль администратора" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
