// Імпорти Firebase
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

console.log("✅ Login.js завантажено успішно!");

window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Форма логіну відправлена!");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showAlert("Введіть email та пароль!", "error");
      return;
    }

    showLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Успішний вхід:", user.uid);

      showAlert("Успішний вхід! Перенаправляємо...", "success");

      setTimeout(() => {
        window.location.href = "../html/home.html"; // перекидає на home.html
      }, 1500);

    } catch (error) {
      console.error("❌ Помилка авторизації:", error);
      handleFirebaseError(error);
      showLoading(false);
    }
  });
});

// ======================
// Допоміжні функції
// ======================
function handleFirebaseError(error) {
  const errors = {
    "auth/user-not-found": "Користувача з таким email не існує",
    "auth/wrong-password": "Неправильний пароль",
    "auth/invalid-email": "Неправильний формат email",
    "auth/too-many-requests": "Забагато спроб входу. Спробуйте пізніше",
  };
  showAlert(errors[error.code] || error.message, "error");
}

function showLoading(show) {
  const btn = document.querySelector("button[type='submit']");
  if (btn) {
    btn.disabled = show;
    btn.innerHTML = show
      ? '<span class="spinner-border spinner-border-sm"></span> Завантаження...'
      : "Увійти";
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
