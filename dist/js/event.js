// event.js
import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('concertDetails');
  container.innerHTML = '<p class="text-center text-muted">Завантаження концерту...</p>';

  // Отримуємо id з URL
  const params = new URLSearchParams(window.location.search);
  const concertId = params.get('id');

  if (!concertId) {
    container.innerHTML = '<p class="text-danger text-center">Концерт не знайдено 😔</p>';
    return;
  }

  try {
    const docRef = doc(db, 'concerts', concertId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      container.innerHTML = '<p class="text-danger text-center">Концерт не знайдено 😔</p>';
      return;
    }

    const data = docSnap.data();
    const monthNames = ['СІЧ','ЛЮТ','БЕР','КВІТ','ТРАВ','ЧЕРВ','ЛИП','СЕРП','ВЕР','ЖОВТ','ЛИСТ','ГРУД'];
    const dateObj = new Date(data.dateTime);
    const day = dateObj.getDate().toString().padStart(2,'0');
    const month = monthNames[dateObj.getMonth()];
    const time = dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    // Постер та інші дані
    const posterUrl = data.posterUrl || '../img/default_poster.jpg';
    const title = data.title || 'Без назви';
    const description = data.description || 'Немає опису.';

    // Отримуємо дані локації
    let locationName = 'Невідома локація';
    let coordinates = null;
    if (data.locationId) {
      const locDoc = await getDoc(doc(db, 'locations', data.locationId));
      if (locDoc.exists()) {
        const locData = locDoc.data();
        locationName = locData.name || locationName;
        coordinates = locData.coordinates || null;
      }
    }

    // Кнопка для карти
    let mapBtn = '';
    if (coordinates) {
      mapBtn = `<button class="btn btn-sm btn-outline-primary mt-2" id="viewMapBtn">Переглянути на карті</button>`;
    }

    container.innerHTML = `
      <div class="concert-card d-flex flex-wrap bg-white rounded shadow-sm p-3 mb-4">
        <img src="${posterUrl}" alt="${title}" class="concert-poster me-4 mb-3">
        <div class="concert-info flex-fill">
          <h3 class="concert-title">${title}</h3>
          <p class="concert-location">📍 ${locationName}</p>
          <p class="concert-date-time">🗓 ${day} ${month} | ⏰ ${time}</p>
          <p class="concert-description">${description}</p>
          ${mapBtn}
        </div>
      </div>
    `;

    // Додаємо обробник для кнопки карти
    if (coordinates) {
      const mapButton = document.getElementById('viewMapBtn');
      mapButton.addEventListener('click', () => {
        const [lat, lng] = coordinates.split(',').map(c => c.trim());
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
      });
    }

  } catch (error) {
    console.error('Помилка завантаження концерту:', error);
    container.innerHTML = '<p class="text-danger text-center">Не вдалося завантажити концерт 😔</p>';
  }
});
