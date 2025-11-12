import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
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
      rentalsTable.innerHTML = `<tr><td colspan="9" class="text-muted">Немає активних заявок.</td></tr>`;
      return;
    }

    let index = 1;
    for (const docSnap of snapshot.docs) {
      const rental = docSnap.data();

      // --- Отримуємо назву інструменту ---
      const instrumentDoc = await getDoc(doc(db, "instruments", rental.instrumentId));
      const instrumentName = instrumentDoc.exists() ? instrumentDoc.data().name : "—";

      // --- Отримуємо інформацію про користувача ---
      let userEmail = "—";
      let userPhone = "—";

      if (rental.userId) {
        const userDoc = await getDoc(doc(db, "users", rental.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userEmail = userData.email || "—";
          userPhone = userData.phoneNumber || "—";
        }
      }

      // --- Формуємо рядок таблиці ---
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index++}</td>
        <td>${instrumentName}</td>
        <td>${userEmail}</td>
        <td>${userPhone}</td>
        <td>${formatDate(rental.startDate)}</td>
        <td>${formatDate(rental.endDate)}</td>
        <td>${rental.totalPrice}</td>
        <td>
          <span class="badge ${
        rental.status === "Орендовано"
          ? "bg-warning text-dark"
          : rental.status === "Не доступно"
            ? "bg-secondary"
            : "bg-success"
      }">
            ${rental.status}
          </span>
        </td>
        <td class="text-center">
          <select class="form-select form-select-sm status-select w-auto"
                  data-id="${rental.rentalId}"
                  data-instrument="${rental.instrumentId}">
            <option value="Орендовано" ${rental.status === "Орендовано" ? "selected" : ""}>Орендовано</option>
            <option value="Не доступно" ${rental.status === "Не доступно" ? "selected" : ""}>Не доступно</option>
            <option value="Доступно" ${rental.status === "Доступно" ? "selected" : ""}>Доступно</option>
          </select>
        </td>
      `;
      rentalsTable.appendChild(row);
    }

    addListeners();

  } catch (error) {
    console.error("❌ Помилка при завантаженні оренд:", error);
    rentalsTable.innerHTML = `<tr><td colspan="9" class="text-danger">Не вдалося завантажити заявки.</td></tr>`;
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
// Обробники подій
// =============================
function addListeners() {
  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", async e => {
      const rentalId = e.target.dataset.id;
      const instrumentId = e.target.dataset.instrument;
      const newStatus = e.target.value;

      try {
        if (newStatus === "Доступно") {
          // Якщо інструмент знову доступний — видаляємо заявку
          await deleteDoc(doc(db, "rentals", rentalId));
          await updateDoc(doc(db, "instruments", instrumentId), { status: "Доступно" });
          alert("✅ Заявку видалено, інструмент знову доступний!");
        } else {
          // Інакше просто оновлюємо статус оренди й інструмента
          await updateDoc(doc(db, "rentals", rentalId), { status: newStatus });
          await updateDoc(doc(db, "instruments", instrumentId), {
            status: newStatus === "Не доступно" ? "Не доступно" : "Орендовано"
          });
          alert(`✅ Статус оновлено на "${newStatus}"`);
        }

        loadRentals();

      } catch (error) {
        console.error("❌ Помилка при оновленні:", error);
        alert("Не вдалося оновити статус. Спробуйте пізніше.");
      }
    });
  });
}

// =============================
// Ініціалізація
// =============================
document.addEventListener("DOMContentLoaded", loadRentals);
