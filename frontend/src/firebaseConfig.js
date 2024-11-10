// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";



// Вставьте сюда ваши данные конфигурации из Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBFnjwtUlNS1GMBEpQAaQywBKm1Dm9LsxU",
  authDomain: "mystorage-310d4.firebaseapp.com",
  projectId: "mystorage-310d4",
  storageBucket: "mystorage-310d4.firebasestorage.app",
  messagingSenderId: "686049797320",
  appId: "1:686049797320:web:5a20ac5959890d1c60b1fd"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
