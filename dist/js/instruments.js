// instruments.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const instrumentsContainer = document.getElementById("instrumentsContainer");
let cart = [];

// ======================
// Оновлення лічильника корзини
// ======================
function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.length;
}

// ======================
// Завантаження інструментів з Firestore
// ======================
async function loadInstruments() {
  try {
    const snapshot = await getDocs(collection(db, "instruments"));
    instrumentsContainer.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const imgSrc = data.images?.length ? data.images[0] : "../img/logo.png";

      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";
      card.innerHTML = `
        <div class="card instrument-card h-100">
          <img src="${imgSrc}" class="card-img-top" alt="${data.name}">
          <div class="card-body">
            <h5 class="card-title">${data.name}</h5>
            <p class="card-text">Бренд: ${data.brand || "-"}<br>Модель: ${data.model || "-"}</p>
            <p class="card-text">Ціна/день: ${data.pricePerDay || "-"}₴</p>
            <button class="btn btn-primary w-100" onclick="addToCart('${doc.id}', '${data.name}')">Орендувати</button>
          </div>
        </div>
      `;
      instrumentsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("❌ Помилка при завантаженні інструментів:", error);
    instrumentsContainer.innerHTML = `<p class="text-danger">Помилка завантаження інструментів. Спробуйте пізніше.</p>`;
  }
}

// ======================
// Додавання інструменту до корзини
// ======================
window.addToCart = function(id, name) {
  if (!cart.includes(id)) {
    cart.push(id);
    updateCartCount();
    alert(`Інструмент "${name}" додано до корзини!`);
  } else {
    alert(`Інструмент "${name}" вже у корзині.`);
  }
};

// ======================
// Ініціалізація
// ======================
document.addEventListener("DOMContentLoaded", () => {
  loadInstruments();
  updateCartCount();
});
