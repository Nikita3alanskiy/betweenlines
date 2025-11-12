import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

const rightNav = document.getElementById("rightNav");
const authButtons = rightNav ? rightNav.querySelectorAll(".btn-login, .btn-register") : [];
const currentPage = window.location.pathname.split("/").pop();

// Функція для обробки користувача
async function handleUser(user) {
  if (!user) {
    // Якщо користувач не авторизований, нічого не робимо
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const role = userData.role;

      if (role === "moderator" || role === "admin") addModeratorLink();
      if (role === "admin") addAdminLink();

      // Приховуємо кнопки авторизації та реєстрації
      authButtons.forEach(btn => btn.style.display = "none");

      // Додаємо "Мій профіль"
      addAccountDropdown(userData, rightNav);
    } else {
      console.error("Користувач не знайдений у базі даних!");
    }
  } catch (error) {
    console.error("Помилка отримання ролі користувача:", error);
  }
}

// Перевірка одразу при завантаженні
handleUser(auth.currentUser);

// Слухач змін авторизації
onAuthStateChanged(auth, handleUser);

function addModeratorLink() {
  const nav = document.querySelector(".navbar-nav");
  if (nav) {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a class="nav-link" href="../html/moderator.html">Панель модератора</a>`;
    nav.appendChild(li);
  }
}

function addAdminLink() {
  const nav = document.querySelector(".navbar-nav");
  if (nav) {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a class="nav-link" href="../html/admin.html">Адмін панель</a>`;
    nav.appendChild(li);
  }
}

function addAccountDropdown(userData, container) {
  if (!container) return;

  const li = document.createElement("li");
  li.className = "nav-item dropdown";

  li.innerHTML = `
    <a class="nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-bs-toggle="dropdown">
      Мій профіль
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown" style="min-width: 220px; padding: 10px;">
      <li><strong>Ім'я:</strong> ${userData.displayName || ""}</li>
      <li><strong>Email:</strong> ${userData.email || ""}</li>
      <li><strong>Телефон:</strong> ${userData.phoneNumber || "-"}</li>
      <li><hr class="dropdown-divider"></li>
      <li><button id="logoutBtn" class="btn btn-danger w-100">Вийти</button></li>
    </ul>
  `;

  container.appendChild(li);

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../html/login.html";
  });
}
