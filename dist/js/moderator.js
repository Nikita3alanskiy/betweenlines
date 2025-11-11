import { db } from './firebase-config.js';
import {
  collection, getDocs, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const rentalsTable = document.querySelector("#rentalsTable tbody");

// =============================
// Завантаження всіх оренд
// =============================
async function loadRentals() {
  try {
    const snapshot = await getDocs(collection(db, "rentals"));
    rentalsTable.innerHTML = "";

    if (snapshot.empty) {
      rentalsTable.innerHTML = `<tr><td colspan="8" class="text-muted">Немає активних заявок.</td></tr>`;
      return;
    }

    let index = 1;
    for (const docSnap of snapshot.docs) {
      const rental = docSnap.data();

      // Отримуємо назву інструменту
      const instrumentDoc = await getDoc(doc(db, "instruments", rental.instrumentId));
      const instrumentName = instrumentDoc.exists() ? instrumentDoc.data().name : "—";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index++}</td>
        <td>${instrumentName}</td>
        <td>${rental.userId}</td>
        <td>${formatDate(rental.startDate)}</td>
        <td>${formatDate(rental.endDate)}</td>
        <td>${rental.totalPrice}</td>
        <td>
          <span class="badge ${rental.status === "Орендовано" ? "bg-warning text-dark" : "bg-success"}">
            ${rental.status}
          </span>
        </td>
        <td>
          <select class="form-select form-select-sm status-select" data-id="${rental.rentalId}" data-instrument="${rental.instrumentId}">
            <option value="Орендовано" ${rental.status === "Орендовано" ? "selected" : ""}>Орендовано</option>
            <option value="Доступно" ${rental.status === "Доступно" ? "selected" : ""}>Доступно</option>
          </select>
        </td>
      `;
      rentalsTable.appendChild(row);
    }

    addListeners();

  } catch (error) {
    console.error("❌ Помилка при завантаженні оренд:", error);
    rentalsTable.innerHTML = `<tr><td colspan="8" class="text-danger">Не вдалося завантажити заявки.</td></tr>`;
  }
}

// =============================
// Форматування дати
// =============================
function formatDate(dateObj) {
  if (!dateObj) return "—";
  const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return date.toLocaleDateString("uk-UA");
}

// =============================
// Обробник зміни статусу
// =============================
function addListeners() {
  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", async e => {
      const rentalId = e.target.dataset.id;
      const instrumentId = e.target.dataset.instrument;
      const newStatus = e.target.value;

      try {
        // Оновлення статусу в rentals
        await updateDoc(doc(db, "rentals", rentalId), { status: newStatus });

        // Якщо статус “Доступно” — оновлюємо інструмент
        if (newStatus === "Доступно") {
          await updateDoc(doc(db, "instruments", instrumentId), { status: "Доступно" });
        } else {
          await updateDoc(doc(db, "instruments", instrumentId), { status: "Не доступно" });
        }

        alert(`✅ Статус оренди оновлено на "${newStatus}"`);
        loadRentals();

      } catch (error) {
        console.error("❌ Помилка при оновленні статусу:", error);
        alert("Не вдалося оновити статус. Спробуйте пізніше.");
      }
    });
  });
}

// =============================
// Ініціалізація
// =============================
document.addEventListener("DOMContentLoaded", loadRentals);
