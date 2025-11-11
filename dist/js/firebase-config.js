// Імпорт SDK Firebase (модульний синтаксис)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";

// 🔹 Конфігурація твого проєкту
const firebaseConfig = {
  apiKey: "AIzaSyCbN4TWvatNReyX6Lx6jrWgJhL9aVHYjrc",
  authDomain: "betweenlines-e1ddb.firebaseapp.com",
  projectId: "betweenlines-e1ddb",
  storageBucket: "betweenlines-e1ddb.firebasestorage.app",
  messagingSenderId: "973000649249",
  appId: "1:973000649249:web:73e9860cb89fc4cd25d160",
  measurementId: "G-1ZGDQHVGL1"
};

// 🔹 Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log("✅ Firebase ініціалізовано успішно!");

// 🔹 Експортуємо, щоб використовувати в інших файлах (якщо потрібно)
export { app, auth, db };
