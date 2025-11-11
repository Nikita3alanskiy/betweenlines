// instruments.js
import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, doc, setDoc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const instrumentsContainer = document.getElementById("instrumentsContainer");
let cart = [];

// ======================
// Лічильник корзини
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

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const imgSrc = data.images?.length ? data.images[0] : "../img/logo.png";

      const isAvailable = data.status?.toLowerCase() === "доступно";
      const buttonText = isAvailable ? "Орендувати" : (data.status || "Недоступно");
      const buttonClass = isAvailable ? "btn btn-primary w-100" : "btn btn-secondary w-100";
      const buttonDisabled = isAvailable ? "" : "disabled";

      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";
      card.innerHTML = `
        <div class="card instrument-card h-100">
          <img src="${imgSrc}" class="card-img-top" alt="${data.name}">
          <div class="card-body">
            <h5 class="card-title">${data.name}</h5>
            <p class="card-text">
              Бренд: ${data.brand || "-"}<br>
              Модель: ${data.model || "-"}
            </p>
            <p class="card-text">Ціна/день: ${data.pricePerDay || "-"}₴</p>
            <button class="${buttonClass}" ${buttonDisabled} onclick="openRentalModal('${docSnap.id}')">
              ${buttonText}
            </button>
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
// Модальне вікно оренди
// ======================
const rentalModal = new bootstrap.Modal(document.getElementById('rentalModal'));
let currentInstrument = null;

// Відкриття модального вікна
window.openRentalModal = async function(instrumentId) {
  try {
    const instrumentDoc = await getDoc(doc(db, "instruments", instrumentId));
    if (!instrumentDoc.exists()) return;

    const data = instrumentDoc.data();
    currentInstrument = { id: instrumentId, ...data };

    // Заповнення модального вікна
    document.getElementById("modalInstrumentImg").src = data.images?.[0] || "../img/logo.png";
    document.getElementById("modalInstrumentName").textContent = data.name;
    document.getElementById("modalInstrumentBrand").textContent = data.brand || "-";
    document.getElementById("modalInstrumentModel").textContent = data.model || "-";
    document.getElementById("modalInstrumentCategory").textContent = data.category || "-";
    document.getElementById("modalInstrumentDescription").textContent = data.description || "-";
    document.getElementById("modalInstrumentPrice").textContent = data.pricePerDay || "0";

    // Скидання дат і суми
    document.getElementById("rentalStartDate").value = "";
    document.getElementById("rentalEndDate").value = "";
    document.getElementById("rentalTotalPrice").textContent = "0";

    rentalModal.show();
  } catch (error) {
    console.error("❌ Помилка при відкритті модального вікна:", error);
  }
};

// ======================
// Розрахунок суми оренди
// ======================
function calculateTotalPrice() {
  const start = new Date(document.getElementById("rentalStartDate").value);
  const end = new Date(document.getElementById("rentalEndDate").value);
  if (!start || !end || !currentInstrument) return 0;

  // Кількість днів включно з першим днем
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const total = days * Number(currentInstrument.pricePerDay || 0);
  document.getElementById("rentalTotalPrice").textContent = total;
  return total;
}

document.getElementById("rentalStartDate").addEventListener("change", calculateTotalPrice);
document.getElementById("rentalEndDate").addEventListener("change", calculateTotalPrice);

// ======================
// Підтвердження оренди
// ======================
document.getElementById("confirmRentalBtn").addEventListener("click", async () => {
  if (!auth.currentUser) {
    alert("❌ Будь ласка, увійдіть у систему.");
    return;
  }

  const startDate = document.getElementById("rentalStartDate").value;
  const endDate = document.getElementById("rentalEndDate").value;
  const totalPrice = calculateTotalPrice();

  if (!currentInstrument || !startDate || !endDate) {
    alert("Будь ласка, заповніть усі поля.");
    return;
  }

  const rentalId = crypto.randomUUID();

  try {
    // 1️⃣ Додаємо запис про оренду
    await setDoc(doc(db, "rentals", rentalId), {
      rentalId,
      instrumentId: currentInstrument.id,
      userId: auth.currentUser.uid,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice,
      status: "Орендовано"
    });

    // 2️⃣ Оновлюємо статус інструменту у базі
    const instrumentRef = doc(db, "instruments", currentInstrument.id);
    await updateDoc(instrumentRef, { status: "Не доступно" });

    // 3️⃣ Повідомлення користувачу
    alert(`✅ Інструмент "${currentInstrument.name}" успішно орендовано!`);
    rentalModal.hide();

    // 4️⃣ Оновлення відображення інструментів
    await loadInstruments();

  } catch (error) {
    console.error("❌ Помилка при підтвердженні оренди:", error);
    alert("Сталася помилка під час оренди. Спробуйте пізніше.");
  }
});

// ======================
// Ініціалізація
// ======================
document.addEventListener("DOMContentLoaded", () => {
  loadInstruments();
  updateCartCount();
});
