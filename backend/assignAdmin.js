// assignAdmin.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json'); // Убедитесь, что путь корректен

// Инициализация Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Функция для назначения роли администратора
async function setAdminRole(uid) {
  try {
    // Назначаем кастомные утверждения (custom claims)
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Обновляем документ пользователя в Firestore (если необходимо)
    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.update({ role: 'admin' });

    console.log(`Роль администратора успешно назначена пользователю с UID: ${uid}`);
  } catch (error) {
    console.error('Ошибка при назначении роли администратора:', error);
  }
}

// Получение UID пользователя из аргументов командной строки
const uid = process.argv[2];

if (!uid) {
  console.error('Пожалуйста, укажите UID пользователя в качестве аргумента.');
  process.exit(1);
}

// Вызов функции назначения роли администратора
setAdminRole(uid).then(() => process.exit());
