// Імпорти модулів Firebase
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

console.log("✅ Register.js завантажено успішно!");

// ======================
// Обробник реєстрації
// ======================
window.addEventListener("DOMContentLoaded", function() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log("Форма відправлена!");

    const displayName = document.getElementById("displayName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!validateForm(displayName, email, password, confirmPassword)) return;

    showLoading(true);

    try {
      console.log("Створюємо користувача...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Користувач створений:", user.uid);

      await updateProfile(user, { displayName });

      const userData = {
        userId: user.uid,
        email,
        displayName,
        phoneNumber: phoneNumber || "",
        role: "user",
        createdAt: new Date().toISOString(),
      };

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        console.log("ℹ️ Користувач уже існує у Firestore, оновлюємо...");
        await updateDoc(userRef, userData);
      } else {
        console.log("✅ Додаємо користувача у Firestore...");
        await setDoc(userRef, userData);
      }

      console.log("✅ Дані збережено у Firestore!");
      showAlert("✅ Реєстрація успішна! Перенаправляємо...", "success");

      setTimeout(() => (window.location.href = "../index.html"), 2000);

    } catch (error) {
      console.error("❌ Помилка:", error);

      if (error.code === "auth/email-already-in-use") {
        try {
          const signIn = await signInWithEmailAndPassword(auth, email, password);
          const user = signIn.user;

          await setDoc(doc(db, "users", user.uid), {
            email,
            displayName,
            phoneNumber: phoneNumber || "",
            role: "user",
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          showAlert("✅ Обліковий запис уже існує, дані оновлено!", "success");
          setTimeout(() => (window.location.href = "../index.html"), 2000);
          return;
        } catch (innerErr) {
          console.error("❌ Помилка при оновленні існуючого користувача:", innerErr);
          showAlert("Цей email вже використовується іншим користувачем.", "error");
        }
      } else {
        handleFirebaseError(error);
      }

      showLoading(false);
    }
  });
});

// ======================
// Допоміжні функції
// ======================
function validateForm(displayName, email, password, confirmPassword) {
  if (displayName.length < 2) {
    showAlert("Ім'я має бути мінімум 2 символи!", "error");
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert("Введіть коректний email!", "error");
    return false;
  }
  if (password.length < 8) {
    showAlert("Пароль має бути мінімум 8 символів!", "error");
    return false;
  }
  if (password !== confirmPassword) {
    showAlert("Паролі не співпадають!", "error");
    return false;
  }
  return true;
}

function handleFirebaseError(error) {
  const errors = {
    "auth/email-already-in-use": "Цей email вже використовується",
    "auth/invalid-email": "Неправильний формат email",
    "auth/operation-not-allowed": "Реєстрація не увімкнена",
    "auth/weak-password": "Пароль занадто слабкий",
  };
  showAlert(errors[error.code] || error.message, "error");
}

function showLoading(show) {
  const btn = document.querySelector("button[type='submit']");
  if (btn) {
    btn.disabled = show;
    btn.innerHTML = show
      ? '<span class="spinner-border spinner-border-sm"></span> Завантаження...'
      : "Зареєструватися";
  }
}

function showAlert(message, type) {
  document.querySelectorAll(".custom-alert").forEach(a => a.remove());
  const alert = document.createElement("div");
  alert.className = `custom-alert alert alert-${type === "error" ? "danger" : "success"} alert-dismissible fade show`;
  alert.style.cssText = "position: fixed; top: 100px; right: 20px; z-index: 9999; min-width: 300px;";
  alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alert);
  if (type === "error") setTimeout(() => alert.remove(), 5000);
}
