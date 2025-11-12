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

      // Дані локації
      let locationName = "—";
      let coordinates = null;
      if (concert.locationId) {
        const locDoc = await getDoc(doc(db, "locations", concert.locationId));
        if (locDoc.exists()) {
          const locData = locDoc.data();
          locationName = locData.name || "—";
          coordinates = locData.coordinates || null;
        }
      }

      // Дата та час
      const dateObj = new Date(concert.dateTime);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const monthNames = ['СІЧ','ЛЮТ','БЕР','КВІТ','ТРАВ','ЧЕРВ','ЛИП','СЕРП','ВЕР','ЖОВТ','ЛИСТ','ГРУД'];
      const month = monthNames[dateObj.getMonth()];
      const timeStr = dateObj.toLocaleTimeString("uk-UA", { hour: '2-digit', minute: '2-digit' });

      // Картка концерту
      const concertCard = document.createElement("div");
      concertCard.className = "concert-card mb-4 bg-white";

      // Посилання на карту, якщо координати є
      let mapLink = '';
      if (coordinates) {
        mapLink = `<button class="btn btn-sm btn-outline-primary mt-2 view-map-btn">Переглянути на карті</button>`;
      }

      concertCard.innerHTML = `
        <img src="${concert.posterUrl || '../img/logo.png'}" alt="${concert.title}" class="concert-poster">
        <div class="concert-info">
          <h3 class="concert-title">${concert.title}</h3>
          <p class="concert-location">📍 ${locationName}</p>
          <p class="concert-date-time">📅 ${day} ${month} | 🕒 ${timeStr}</p>
          <p class="concert-description">${concert.description || ''}</p>
          ${mapLink}
        </div>
      `;

      // Кнопка перегляду на карті
      const mapBtn = concertCard.querySelector(".view-map-btn");
      if (mapBtn && coordinates) {
        mapBtn.addEventListener("click", () => {
          const [lat, lng] = coordinates.split(",").map(c => c.trim());
          window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
        });
      }

      concertsContainer.appendChild(concertCard);
    }

  } catch (error) {
    console.error("❌ Помилка при завантаженні концертів:", error);
    concertsContainer.innerHTML = `<p class="text-center text-danger">Не вдалося завантажити концерти.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadConcerts);
