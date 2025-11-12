// Імпорти Firebase
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
// Маска телефону
// ======================
function setupPhoneMask() {
  const phoneInput = document.getElementById("phoneNumber");
  if (!phoneInput) return;

  phoneInput.addEventListener("input", function () {
    let value = phoneInput.value.replace(/\D/g, ""); // лише цифри
    if (value.startsWith("380")) value = value.slice(2); // уникнути дублювання +38
    if (value.startsWith("0")) value = value.slice(1);

    let formatted = "+38 (0";
    if (value.length > 0) formatted += value.substring(0, 2);
    if (value.length >= 3) formatted += ") " + value.substring(2, 5);
    if (value.length >= 6) formatted += "-" + value.substring(5, 7);
    if (value.length >= 8) formatted += "-" + value.substring(7, 9);

    phoneInput.value = formatted;
  });
}

// ======================
// Обробник реєстрації
// ======================
window.addEventListener("DOMContentLoaded", function() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  setupPhoneMask();

  registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const displayName = document.getElementById("displayName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!validateForm(displayName, email, phoneNumber, password, confirmPassword)) return;

    showLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      const userData = {
        userId: user.uid,
        email,
        displayName,
        phoneNumber,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        await updateDoc(userRef, userData);
      } else {
        await setDoc(userRef, userData);
      }

      showAlert("Реєстрація успішна! Перенаправляємо...", "success");
      setTimeout(() => (window.location.href = "../html/login.html"), 2000);

    } catch (error) {
      console.error("Помилка:", error);
      if (error.code === "auth/email-already-in-use") {
        try {
          const signIn = await signInWithEmailAndPassword(auth, email, password);
          const user = signIn.user;

          await setDoc(doc(db, "users", user.uid), {
            email,
            displayName,
            phoneNumber,
            role: "user",
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          showAlert("✅ Обліковий запис уже існує, дані оновлено!", "success");
          setTimeout(() => (window.location.href = "../html/login.html"), 2000);
          return;
        } catch (innerErr) {
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
// Валідація полів
// ======================
function validateForm(displayName, email, phoneNumber, password, confirmPassword) {
  if (!displayName || !email || !phoneNumber || !password || !confirmPassword) {
    showAlert("Будь ласка, заповніть усі поля!", "error");
    return false;
  }

  if (displayName.length < 2) {
    showAlert("Ім'я має бути мінімум 2 символи!", "error");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert("Введіть коректний email!", "error");
    return false;
  }

  if (!/^\+38\s?\(0\d{2}\)\s?\d{3}-\d{2}-\d{2}$/.test(phoneNumber)) {
    showAlert("Введіть коректний номер телефону у форматі +38 (0XX) XXX-XX-XX", "error");
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

// ======================
// Повідомлення
// ======================
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
