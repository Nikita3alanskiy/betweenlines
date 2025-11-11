import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const concertsContainer = document.getElementById("concertsContainer");

async function loadConcerts() {
  try {
    const snapshot = await getDocs(collection(db, "concerts"));
    concertsContainer.innerHTML = "";

    if (snapshot.empty) {
      concertsContainer.innerHTML = `<p class="text-center text-muted">Поки що немає концертів.</p>`;
      return;
    }

    for (const docSnap of snapshot.docs) {
      const concert = docSnap.data();

      // Отримуємо назву локації
      let locationName = "—";
      if (concert.locationId) {
        const locDoc = await getDoc(doc(db, "locations", concert.locationId));
        if (locDoc.exists()) locationName = locDoc.data().name || "—";
      }

      const dateObj = new Date(concert.dateTime);
      const day = dateObj.toLocaleDateString("uk-UA", { day: "2-digit" });
      const month = dateObj.toLocaleDateString("uk-UA", { month: "short" }).toUpperCase();
      const timeStr = dateObj.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

      const concertItem = document.createElement("div");
      concertItem.className = "concert-item";

      concertItem.innerHTML = `
        <div class="concert-date">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
        </div>
        <img src="${concert.posterUrl || '../img/logo.png'}" alt="${concert.title}" class="concert-poster">
        <div class="concert-info">
          <h3 class="concert-title">${concert.title}</h3>
          <p class="concert-location">📍 ${locationName}</p>
          <p class="concert-description">${concert.description}</p>
        </div>
        <div class="concert-time">${timeStr}</div>
      `;

      concertsContainer.appendChild(concertItem);
    }

  } catch (error) {
    console.error("❌ Помилка при завантаженні концертів:", error);
    concertsContainer.innerHTML = `<p class="text-center text-danger">Не вдалося завантажити концерти.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadConcerts);
