const firebaseConfig = {
  apiKey: "AIzaSyCQLY4f_PceTsy5Ul_ghtdt7liSmZ2W7rY",
  authDomain: "web-portal-muz.firebaseapp.com",
  projectId: "web-portal-muz",
  storageBucket: "web-portal-muz.firebasestorage.app",
  messagingSenderId: "251952516481",
  appId: "1:251952516481:web:6caa69697e4daf52a4ac80",
  measurementId: "G-WM91LN0VZS"
};
// Перевірка чи Firebase вже ініціалізовано
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // якщо вже ініціалізовано, використовуємо існуючий
}

const auth = firebase.auth();
const db = firebase.firestore();

console.log('Firebase ініціалізовано успішно!'); // Це має з'явитись в консолі
