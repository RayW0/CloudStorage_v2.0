// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Вставьте сюда ваши данные конфигурации из Firebase Console
const firebaseConfig = {
  apiKey: 'AIzaSyBFnjwtUlNS1GMBEpQAaQywBKm1Dm9LsxU',
  authDomain: 'mystorage-310d4.firebaseapp.com',
  projectId: 'mystorage-310d4',
  storageBucket: 'mystorage-310d4.firebasestorage.app',
  messagingSenderId: '686049797320',
  appId: '1:686049797320:web:5a20ac5959890d1c60b1fd'
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Инициализируем Storage

export { db, auth, storage };
